/**
 * پیکربندی مرکزی پلتفرم «فانوس یادگیری» - نسخهٔ نهایی فاز ۲
 * سازگاری ۱۰۰٪ با نسخه‌های قبلی (camelCase) و نسخهٔ جدید (UPPER_CASE)
 * نکته امنیتی: هیچ رمز عبور، کلید محرمانه یا کد دعوتی در این فایل نگهداری نمی‌شود.
 */
(function (global) {
  "use strict";

  // مقادیر پایه و ثابت‌های اصلی فاز ۲
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

  // ثبت آبجکت اصلی با پشتیبانی هم‌زمان از کلیدهای camelCase و UPPER_CASE
  global.FANOOS_CONFIG = {
    // آدرس سرور Apps Script (هر دو کلید به یک رشتهٔ دقیق اشاره می‌کنند)
    apiUrl: API_URL,
    API_URL: API_URL,

    // نسخهٔ تنظیمات
    appVersion: APP_VERSION,
    APP_VERSION: APP_VERSION,

    // حد نصاب کلاس (به همراه نام قبلی targetClassSize)
    classQuota: CLASS_QUOTA,
    CLASS_QUOTA: CLASS_QUOTA,
    targetClassSize: CLASS_QUOTA,

    // طول پیش‌فرض دوره (روز)
    defaultCycleDays: DEFAULT_CYCLE_DAYS,
    DEFAULT_CYCLE_DAYS: DEFAULT_CYCLE_DAYS,

    // مشخصات ظاهری پلتفرم
    platformName: "فانوس یادگیری",
    platformSubtitle: "کلاس هوشمند، بازی و یادگیری تعاملی",

    // پایه‌های تحصیلی (و ageGroups معادل آن برای سازگاری عقب‌رو)
    grades: GRADES,
    GRADES: GRADES,
    ageGroups: AGE_GROUPS,

    // توابع کمکی یکسان‌سازی پایه/رده سنی
    normalizeGrade: normalizeGrade,
    normalizeAgeGroup: normalizeAgeGroup,

    // سیستم رونمایی و اطلاع‌رسانی سه‌لایه
    announcement: ANNOUNCEMENT,
    ANNOUNCEMENT: ANNOUNCEMENT,

    // پوشه‌های تالار دانش‌آموز (به همراه نام قبلی modules)
    folders: FOLDERS,
    FOLDERS: FOLDERS,
    modules: FOLDERS,

    // موارد پیش‌فرض چک‌لیست
    checklistPresets: CHECKLIST_PRESETS,

    // فهرست همه‌کارهٔ بازی‌ها
    games: GAMES,
    GAMES: GAMES,

    // تابع جستجوی بازی
    getGameById: getGameById
  };
})(window);
```
