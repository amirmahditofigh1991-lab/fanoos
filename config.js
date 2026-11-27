window.FANOOS_CONFIG = {
  apiUrl: "https://script.google.com/macros/s/AKfycbwboCEekU4zGr72srK-QyXyIc_MOwqdnE_a7px05KCMfj3lBSjCGp3LtDB2lheXkoo/exec",
  platformName: "فانوس یادگیری",
  platformSubtitle: "کلاس هوشمند، بازی و یادگیری تعاملی",
  targetClassSize: 14,

  ageGroups: [
    { value: "12-15", label: "۱۲ تا ۱۵ سال (ترکیبی)" },
    { value: "12", label: "پایه ششم (حدود ۱۲ سال)" },
    { value: "13", label: "پایه هفتم (حدود ۱۳ سال)" },
    { value: "14", label: "پایه هشتم (حدود ۱۴ سال)" },
    { value: "15", label: "پایه نهم (حدود ۱۵ سال)" }
  ],

  normalizeAgeGroup: function (raw) {
    if (!raw) return "12-15";
    const toEn = String(raw)
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .trim();

    const validValues = ["12-15", "12", "13", "14", "15"];
    if (validValues.includes(toEn)) return toEn;

    if (
      /GMT|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|T\d{2}:|دسامبر/i.test(toEn)
    ) {
      return "12-15";
    }

    return "12-15";
  },

  modules: [
    {
      id: "games",
      title: "بازی‌ها و داستان‌ها",
      subtitle: "ماجراجویی‌های تعاملی، داستان‌های قرآنی و چالش‌های یادگیری",
      icon: "🎮",
      accent: "gold",
      defaultEnabled: true
    },
    {
      id: "checklist",
      title: "چک‌لیست و مأموریت هفته",
      subtitle: "تمرین‌ها، کارهای هفتگی و پیگیری برنامه‌های کلاس",
      icon: "✅",
      accent: "teal",
      defaultEnabled: true
    }
  ],

  checklistPresets: [
    "تکمیل بازی و ماجراجویی این هفته",
    "گوش دادن و تمرین فایل قرائت قرآن",
    "پیگیری کارهای جشن یا سرود کلاس",
    "دعوت از یک دوست هم‌سن برای جلسه بعد"
  ],

  games: [
    {
      id: "saleh",
      title: "سرزمین ثمود (حضرت صالح ع)",
      subtitle: "سفر سه‌بعدی در ۱۰ ایستگاه؛ از بتخانه ثمود و معجزه ناقه تا نشان اهل یقین",
      category: "قصه‌های پیامبران",
      icon: "🐪",
      path: "games/saleh/index.html",
      status: "active",
      mode: "stations",
      totalUnits: 10,
      totalStations: 10,
      unitLabel: "ایستگاه",
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
      status: "active",
      mode: "stations",
      totalUnits: 10,
      totalStations: 10,
      unitLabel: "ایستگاه",
      supportsRadar: true,
      supportsTeacherQuestions: true
    }
  ]
};
