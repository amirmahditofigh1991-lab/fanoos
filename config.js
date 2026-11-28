/**
 * پیکربندی مرکزی پلتفرم «فانوس یادگیری» - نسخهٔ نهایی فاز ۲
 * نکته امنیتی: هیچ رمز عبور، کلید محرمانه یا کد دعوتی در این فایل نگهداری نمی‌شود.
 */
window.FANOOS_CONFIG = {
  // نسخهٔ رسمی تنظیمات و پارامترهای پایهٔ دوره
  APP_VERSION: "2.1",
  CLASS_QUOTA: 14,
  DEFAULT_CYCLE_DAYS: 180,

  // نشانی سرویس وب‌اپ گوگل اسکریپت (بدون تغییر)
  API_URL: "https://script.google.com/macros/s/AKfycbwboCEekU4zGr72srK-QyXyIc_MOwqdnE_a7px05KCMfj3lBSjCGp3LtDB2lheXkoo/exec",

  // مشخصات ظاهری پلتفرم
  platformName: "فانوس یادگیری",
  platformSubtitle: "کلاس هوشمند، بازی و یادگیری تعاملی",

  // لیست رسمی پایه‌های تحصیلی (جایگزین لیست قدیمی ردهٔ سنی)
  GRADES: ["پنجم", "ششم", "هفتم", "هشتم", "نهم"],

  /**
   * یکسان‌سازی و اعتبارسنجی نام پایهٔ تحصیلی ورودی
   * از مقادیر متنی رسمی و همچنین مقادیر عددی قدیمی پشتیبانی می‌کند.
   * @param {string|number} raw - مقدار خام دریافتی از فرم یا دیتابیس
   * @returns {string} نام استاندارد پایهٔ تحصیلی یا رشتهٔ خالی در صورت نامعتبر بودن
   */
  normalizeGrade: function (raw) {
    try {
      if (raw === null || raw === undefined) return "";

      const normalized = String(raw)
        .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
        .replace(/^پایه\s*/u, "")
        .trim();

      if (this.GRADES.includes(normalized)) {
        return normalized;
      }

      // نگاشت مقادیر عددی یا قدیمی به پایه‌های رسمی جدید
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

      return legacyMap[normalized] || "";
    } catch (error) {
      console.error("خطا در یکسان‌سازی پایهٔ تحصیلی:", error);
      return "";
    }
  },

  // سیستم رونمایی و اطلاع‌رسانی سه‌لایه (قدم ۴)
  ANNOUNCEMENT: {
    active: false,
    id: "",
    title: "",
    text: ""
  },

  // پوشه‌های اصلی تالار دانش‌آموز با پشتیبانی از نشان «جدید»
  FOLDERS: [
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
  ],

  // موارد پیشنهادی پیش‌فرض برای چک‌لیست هفتگی کلاس
  checklistPresets: [
    "تکمیل بازی و ماجراجویی این هفته",
    "گوش دادن و تمرین فایل قرائت قرآن",
    "پیگیری کارهای جشن یا سرود کلاس",
    "دعوت از یک دوست هم‌سن برای جلسه بعد"
  ],

  /**
   * فهرست همه‌کارهٔ بازی‌ها
   * مقادیر مجاز برای کلید mode:
   * - "units": بازی‌های ایستگاهی، مرحله‌ای یا کارتی (مانند ۱۰ ایستگاه یا ۱۲ کارت)
   * - "score": بازی‌های امتیازی و رکوردی
   * - "completion": بازی‌های داستانی تک‌مرحله‌ای
   */
  GAMES: [
    {
      id: "saleh",
      title: "سرزمین ثمود (حضرت صالح ع)",
      subtitle: "سفر سه‌بعدی در ۱۰ ایستگاه؛ از بتخانه ثمود و معجزه ناقه تا نشان اهل یقین",
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
      subtitle: "ماجراجویی در عصر حضرت نوح (ع)؛ استقامت، ساخت کشتی و آزمون ایمان",
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
  ],

  /**
   * یافتن پیکربندی یک بازی بر اساس شناسهٔ یکتای آن
   * @param {string} gameId - شناسهٔ بازی (مانند "saleh" یا "noah")
   * @returns {Object|null} آبجکت بازی یا null در صورت عدم وجود
   */
  getGameById: function (gameId) {
    try {
      if (!gameId) return null;
      return this.GAMES.find((game) => game.id === gameId) || null;
    } catch (error) {
      console.error("خطا در جستجوی بازی:", error);
      return null;
    }
  }
};

// حفظ سازگاری کامل با ماژول‌هایی که از کلیدهای نام‌گذاری قبلی (camelCase) استفاده می‌کنند
try {
  window.FANOOS_CONFIG.apiUrl = window.FANOOS_CONFIG.API_URL;
  window.FANOOS_CONFIG.targetClassSize = window.FANOOS_CONFIG.CLASS_QUOTA;
  window.FANOOS_CONFIG.grades = window.FANOOS_CONFIG.GRADES;
  window.FANOOS_CONFIG.folders = window.FANOOS_CONFIG.FOLDERS;
  window.FANOOS_CONFIG.modules = window.FANOOS_CONFIG.FOLDERS;
  window.FANOOS_CONFIG.games = window.FANOOS_CONFIG.GAMES;
  window.FANOOS_CONFIG.announcement = window.FANOOS_CONFIG.ANNOUNCEMENT;
} catch (error) {
  console.error("خطا در اتصال کلیدهای سازگاری FANOOS_CONFIG:", error);
}
```
