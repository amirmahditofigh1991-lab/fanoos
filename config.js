/**
 * پیکربندی مرکزی پلتفرم «فانوس یادگیری» - نسخهٔ نهایی فاز ۲
 * سازگاری ۱۰۰٪ با نسخه‌های قبلی (camelCase) و نسخهٔ جدید (UPPER_CASE)
 * نکتهٔ امنیتی: هیچ رمز عبور، کلید محرمانه یا کد دعوتی در این فایل قرار ندارد.
 */
(function () {
  "use strict";

  // ثابت‌های پایه و آدرس سرور Apps Script
  const API_URL =
    "https://script.google.com/macros/s/AKfycbwboCEekU4zGr72srK-QyXyIc_MOwqdnE_a7px05KCMfj3lBSjCGp3LtDB2lheXkoo/exec";
  const APP_VERSION = "2.1";
  const CLASS_QUOTA = 14;
  const DEFAULT_CYCLE_DAYS = 180;

  // لیست رسمی پایه‌های تحصیلی
  const GRADES = ["پنجم", "ششم", "هفتم", "هشتم", "نهم"];

  // معادل سازگار با ساختار قدیمی ageGroups برای بخش‌های قبلی
  const AGE_GROUPS = GRADES.map(function (grade) {
    return {
      value: grade,
      label: "پایه " + grade
    };
  });

  // سیستم رونمایی و اطلاع‌رسانی سه‌لایه (قدم ۴)
  const ANNOUNCEMENT = {
    active: false,
    id: "",
    title: "",
    text: ""
  };

  // پوشه‌های تالار دانش‌آموز با پشتیبانی از تگ «جدید»
  const FOLDERS = [
    {
      id: "games",
      title: "بازی‌ها و داستان‌ها",
      subtitle: "ماجراجویی‌های تعاملی، داستان‌های قرآنی و چالش‌های یادگیری",
      icon: "🎮",
      accent: "gold",
      defaultEnabled: true,
      isNew: false
    },
    {
      id: "checklist",
      title: "چک‌لیست و مأموریت هفته",
      subtitle: "تمرین‌ها، کارهای هفتگی و پیگیری برنامه‌های کلاس",
      icon: "✅",
      accent: "teal",
      defaultEnabled: true,
      isNew: false
    }
  ];

  // موارد پیشنهادی پیش‌فرض برای چک‌لیست هفتگی کلاس
  const CHECKLIST_PRESETS = [
    "تکمیل بازی و ماجراجویی این هفته",
    "گوش دادن و تمرین فایل قرائت قرآن",
    "پیگیری کارهای جشن یا سرود کلاس",
    "دعوت از یک دوست هم‌سن برای جلسه بعد"
  ];

  /**
   * فهرست همه‌کارهٔ بازی‌ها
   * مقادیر مجاز برای mode:
   * - "units": بازی‌های ایستگاهی، مرحله‌ای یا کارتی
   * - "score": بازی‌های امتیازی و رکوردی
   * - "completion": بازی‌های داستانی تک‌مرحله‌ای
   */
  const GAMES = [
    {
      id: "saleh",
      title: "سرزمین ثمود (حضرت صالح ع)",
      subtitle:
        "سفر سه‌بعدی در ۱۰ ایستگاه؛ از بتخانه ثمود و معجزه ناقه تا نشان اهل یقین",
      category: "قصه‌های پیامبران",
      icon: "🐪",
      path: "games/saleh/index.html",
      mode: "units",
      unitLabel: "ایستگاه",
      totalUnits: 10,
      isNew: false,
      status: "active",
      totalStations: 10,
      supportsRadar: true,
      supportsTeacherQuestions: true
    },
    {
      id: "noah",
      title: "کشتی نجات (حضرت نوح ع)",
      subtitle:
        "ماجراجویی در عصر حضرت نوح (ع)؛ استقامت، ساخت کشتی و آزمون ایمان",
      category: "قصه‌های پیامبران",
      icon: "⛵",
      path: "games/noah/index.html",
      mode: "units",
      unitLabel: "ایستگاه",
      totalUnits: 10,
      isNew: false,
      status: "active",
      totalStations: 10,
      supportsRadar: true,
      supportsTeacherQuestions: true
    }
  ];

  /**
   * یکسان‌سازی و اعتبارسنجی نام پایهٔ تحصیلی ورودی
   * از مقادیر متنی رسمی و مقادیر عددی قدیمی پشتیبانی می‌کند.
   * @param {string|number} raw - مقدار خام دریافتی از فرم یا دیتابیس
   * @returns {string} نام رسمی پایهٔ تحصیلی یا رشتهٔ خالی
   */
  function normalizeGrade(raw) {
    try {
      if (raw === null || raw === undefined) return "";

      const normalized = String(raw)
        .replace(/[۰-۹]/g, function (d) {
          return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d));
        })
        .replace(/[٠-٩]/g, function (d) {
          return String("٠١٢٣٤٥٦٧٨٩".indexOf(d));
        })
        .replace(/^پایه\s*/u, "")
        .trim();

      if (GRADES.indexOf(normalized) !== -1) {
        return normalized;
      }

      // نگاشت مقادیر قدیمی عددی یا رده سنی به پایه‌های رسمی جدید
      const legacyMap = {
        "5": "پنجم",
        "11": "پنجم",
        "6": "ششم",
        "12": "ششم",
        "7": "هفتم",
        "13": "هفتم",
        "8": "هشتم",
        "14": "هشتم",
        "9": "نهم",
        "15": "نهم"
      };

      if (legacyMap[normalized]) {
        return legacyMap[normalized];
      }

      // جلوگیری از بازگشت رشته‌های تاریخ نامعتبر گوگل شیت
      if (
        /GMT|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|T\d{2}:|دسامبر/i.test(
          normalized
        )
      ) {
        return "";
      }

      return "";
    } catch (error) {
      console.error("خطا در یکسان‌سازی پایهٔ تحصیلی:", error);
      return "";
    }
  }

  /**
   * تابع سازگار با نام قدیمی normalizeAgeGroup
   * مقدار ورودی را به پایهٔ رسمی تبدیل می‌کند و در صورت نبود مقدار معتبر، اولین پایه را برمی‌گرداند.
   * @param {string|number} raw - مقدار خام رده سنی یا پایه
   * @returns {string} نام رسمی پایهٔ تحصیلی
   */
  function normalizeAgeGroup(raw) {
    return normalizeGrade(raw) || GRADES[0];
  }

  /**
   * یافتن پیکربندی یک بازی بر اساس شناسهٔ یکتای آن
   * @param {string} gameId - شناسهٔ بازی (مانند "saleh" یا "noah")
   * @returns {Object|null} آبجکت بازی یا null در صورت عدم وجود
   */
  function getGameById(gameId) {
    try {
      if (!gameId) return null;
      return (
        GAMES.find(function (game) {
          return game.id === gameId;
        }) || null
      );
    } catch (error) {
      console.error("خطا در جستجوی بازی:", error);
      return null;
    }
  }

  // ثبت نهایی آبجکت روی window.FANOOS_CONFIG با پوشش کامل کلیدهای جدید و قدیمی
  window.FANOOS_CONFIG = {
    // کلیدهای اصلی فاز ۲ (UPPER_CASE)
    API_URL: API_URL,
    APP_VERSION: APP_VERSION,
    CLASS_QUOTA: CLASS_QUOTA,
    DEFAULT_CYCLE_DAYS: DEFAULT_CYCLE_DAYS,
    GRADES: GRADES,
    FOLDERS: FOLDERS,
    ANNOUNCEMENT: ANNOUNCEMENT,
    CHECKLIST_PRESETS: CHECKLIST_PRESETS,
    GAMES: GAMES,

    // کلیدهای نسخهٔ قبلی و معادل‌های camelCase برای سازگاری ۱۰۰٪
    apiUrl: API_URL,
    appVersion: APP_VERSION,
    classQuota: CLASS_QUOTA,
    targetClassSize: CLASS_QUOTA,
    defaultCycleDays: DEFAULT_CYCLE_DAYS,
    platformName: "فانوس یادگیری",
    platformSubtitle: "کلاس هوشمند، بازی و یادگیری تعاملی",
    grades: GRADES,
    ageGroups: AGE_GROUPS,
    normalizeGrade: normalizeGrade,
    normalizeAgeGroup: normalizeAgeGroup,
    folders: FOLDERS,
    modules: FOLDERS,
    announcement: ANNOUNCEMENT,
    checklistPresets: CHECKLIST_PRESETS,
    games: GAMES,
    getGameById: getGameById
  };
})();
