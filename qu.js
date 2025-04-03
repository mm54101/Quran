// المتغيرات العامة
let currentSurah = 1;
let allSurahs = [];

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async () => {
    await loadJuzList();
    await loadAllSurahs();
    await loadSurah(currentSurah);
    setupEventListeners();
});

// تحميل قائمة الأجزاء
async function loadJuzList() {
    const juzSelect = document.getElementById('juz-select');
    for (let i = 1; i <= 30; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `الجزء ${i}`;
        juzSelect.appendChild(option);
    }
}

// تحميل جميع السور
async function loadAllSurahs() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        allSurahs = data.data;
        
        const surahList = document.getElementById('surah-list');
        surahList.innerHTML = '';
        
        allSurahs.forEach(surah => {
            const li = document.createElement('li');
            li.className = 'surah-item';
            li.innerHTML = `
                <a href="#" class="surah-link" data-id="${surah.number}">
                    ${surah.number}. ${surah.englishName} (${surah.name})
                    <span class="surah-meta">${surah.numberOfAyahs} آيات</span>
                </a>
            `;
            surahList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading surahs:', error);
        showError('حدث خطأ في تحميل قائمة السور');
    }
}

// تحميل سورة معينة
async function loadSurah(surahNumber) {
    try {
        showLoading();
        
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
        const data = await response.json();
        
        if (!data.data || !data.data.ayahs) {
            throw new Error('بيانات السورة غير متوفرة');
        }
        
        const surah = data.data;
        
        // تحديث واجهة المستخدم
        document.getElementById('surah-name').textContent = `سورة ${surah.englishName} (${surah.name})`;
        document.getElementById('surah-meta').innerHTML = `
            <span>${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
            <span>${surah.numberOfAyahs} آيات</span>
        `;
        
        // عرض البسملة إذا كانت السورة ليست التوبة
        document.getElementById('bismillah').style.display = surahNumber !== 9 ? 'block' : 'none';
        
        // عرض الآيات
        const ayahContainer = document.getElementById('ayah-container');
        ayahContainer.innerHTML = '';
        
        surah.ayahs.forEach(ayah => {
            const ayahElement = document.createElement('div');
            ayahElement.className = 'ayah';
            ayahElement.innerHTML = `
                <div class="ayah-text">${ayah.text}</div>
                <span class="ayah-number">${ayah.numberInSurah}</span>
                <button class="play-btn" data-audio="${ayah.audio}">
                    <i class="fas fa-play"></i>
                </button>
            `;
            ayahContainer.appendChild(ayahElement);
        });
        
        // تحديث السورة الحالية
        currentSurah = surahNumber;
        
    } catch (error) {
        console.error('Error loading surah:', error);
        showError('حدث خطأ في تحميل السورة');
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التنقل بين السور
    document.getElementById('prev-surah').addEventListener('click', () => {
        if (currentSurah > 1) {
            loadSurah(currentSurah - 1);
        }
    });
    
    document.getElementById('next-surah').addEventListener('click', () => {
        if (currentSurah < 114) {
            loadSurah(currentSurah + 1);
        }
    });
    
    // اختيار سورة من الفهرس
    document.getElementById('surah-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('surah-link') || e.target.closest('.surah-link')) {
            e.preventDefault();
            const surahId = parseInt(e.target.closest('.surah-link').dataset.id);
            loadSurah(surahId);
        }
    });
    
    // تشغيل الآية
    document.getElementById('ayah-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('play-btn') || e.target.closest('.play-btn')) {
            const audioUrl = e.target.closest('.play-btn').dataset.audio;
            playAyah(audioUrl);
        }
    });
    
    // البحث
    document.getElementById('search-input').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const surahItems = document.querySelectorAll('.surah-item');
        
        surahItems.forEach(item => {
            const surahText = item.textContent.toLowerCase();
            item.style.display = surahText.includes(searchTerm) ? 'block' : 'none';
        });
    });
    
    // تصفية حسب الجزء
    document.getElementById('juz-select').addEventListener('change', (e) => {
        const juz = e.target.value;
        filterSurahsByJuz(juz);
    });
}

// وظائف مساعدة
function showLoading() {
    document.getElementById('ayah-container').innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> جاري تحميل الآيات...
        </div>
    `;
}

function showError(message) {
    document.getElementById('ayah-container').innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i> ${message}
        </div>
    `;
}

function playAyah(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.error('Error playing audio:', e));
}

function filterSurahsByJuz(juz) {
    // هذه الوظيفة تحتاج لبيانات إضافية عن توزيع السور على الأجزاء
    // يمكنك إضافة هذه البيانات ككائن في الجافاسكريبت
    console.log('تصفية حسب الجزء:', juz);
}

// التحكم في الفهرس المنبسط
function setupSidebar() {
    const toggleBtn = document.getElementById('toggle-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
    });
    
    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
    
    // إغلاق الفهرس عند النقر خارج المنطقة
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== toggleBtn) {
            sidebar.classList.remove('active');
        }
    });
}

// استدعاء الدالة في تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async () => {
    await loadJuzList();
    await loadAllSurahs();
    await loadSurah(currentSurah);
    setupEventListeners();
    setupSidebar(); // <-- أضف هذا السطر
});


