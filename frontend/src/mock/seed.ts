import type { Category, Specs } from '../api/types'

/** Демо-данные каталога для мок-API. Ключи specs — те же, что ожидает конфигуратор (compatibility.ts). */

export const CATEGORIES: Category[] = [
  { id: 1, slug: 'cpu', name: 'Процессоры' },
  { id: 2, slug: 'motherboard', name: 'Материнские платы' },
  { id: 3, slug: 'ram', name: 'Оперативная память' },
  { id: 4, slug: 'gpu', name: 'Видеокарты' },
  { id: 5, slug: 'storage', name: 'Накопители' },
  { id: 6, slug: 'psu', name: 'Блоки питания' },
  { id: 7, slug: 'case', name: 'Корпуса' },
  { id: 8, slug: 'cooler', name: 'Охлаждение' },
]

export interface SeedComponent {
  id: number
  category: string
  brand: string
  name: string
  price: number
  stock: number
  specs: Specs
  description: string
}

const c = (id: number, category: string, brand: string, name: string, price: number, stock: number, specs: Specs, description: string): SeedComponent =>
  ({ id, category, brand, name, price, stock, specs, description })

export const COMPONENTS: SeedComponent[] = [
  // Процессоры
  c(1, 'cpu', 'AMD', 'Ryzen 5 5600', 9990, 24, { socket: 'AM4', cores: 6, threads: 12, base_ghz: 3.5, boost_ghz: 4.4, tdp: 65 }, 'Лучший выбор для бюджетного игрового ПК на платформе AM4.'),
  c(2, 'cpu', 'AMD', 'Ryzen 5 7600', 17990, 18, { socket: 'AM5', cores: 6, threads: 12, base_ghz: 3.8, boost_ghz: 5.1, tdp: 65 }, 'Современная платформа AM5 с поддержкой DDR5 и PCIe 5.0.'),
  c(3, 'cpu', 'AMD', 'Ryzen 7 7800X3D', 38990, 7, { socket: 'AM5', cores: 8, threads: 16, base_ghz: 4.2, boost_ghz: 5.0, tdp: 120 }, 'Король игровых процессоров благодаря технологии 3D V-Cache.'),
  c(4, 'cpu', 'AMD', 'Ryzen 9 7950X', 49990, 4, { socket: 'AM5', cores: 16, threads: 32, base_ghz: 4.5, boost_ghz: 5.7, tdp: 170 }, 'Флагман для рендеринга, монтажа и тяжёлых рабочих задач.'),
  c(5, 'cpu', 'Intel', 'Core i5-13400F', 16990, 21, { socket: 'LGA1700', cores: 10, threads: 16, base_ghz: 2.5, boost_ghz: 4.6, tdp: 65 }, 'Универсальный процессор среднего уровня для игр и работы.'),
  c(6, 'cpu', 'Intel', 'Core i5-14600KF', 27990, 9, { socket: 'LGA1700', cores: 14, threads: 20, base_ghz: 3.5, boost_ghz: 5.3, tdp: 125 }, 'Разблокированный множитель и 14 ядер для разгона и многозадачности.'),
  c(7, 'cpu', 'Intel', 'Core i7-14700K', 38990, 0, { socket: 'LGA1700', cores: 20, threads: 28, base_ghz: 3.4, boost_ghz: 5.6, tdp: 125 }, 'Мощный 20-ядерный процессор для стриминга и игр на максимальных настройках.'),

  // Материнские платы
  c(10, 'motherboard', 'ASUS', 'ASUS TUF GAMING B550-PLUS', 12990, 11, { socket: 'AM4', chipset: 'B550', memory_type: 'DDR4', form_factor: 'ATX', ram_slots: 4, max_ram_gb: 128 }, 'Надёжная плата на B550 с усиленным питанием и поддержкой PCIe 4.0.'),
  c(11, 'motherboard', 'MSI', 'MSI MAG B650M MORTAR WIFI', 15490, 14, { socket: 'AM5', chipset: 'B650', memory_type: 'DDR5', form_factor: 'mATX', ram_slots: 4, max_ram_gb: 192 }, 'Компактная плата под AM5 с Wi‑Fi 6E и мощным VRM.'),
  c(12, 'motherboard', 'ASUS', 'ASUS TUF GAMING B650-PLUS WIFI', 18990, 10, { socket: 'AM5', chipset: 'B650', memory_type: 'DDR5', form_factor: 'ATX', ram_slots: 4, max_ram_gb: 192 }, 'Полноразмерная B650 с PCIe 5.0 и Wi‑Fi 6.'),
  c(13, 'motherboard', 'Gigabyte', 'Gigabyte X670 AORUS ELITE AX', 24990, 5, { socket: 'AM5', chipset: 'X670', memory_type: 'DDR5', form_factor: 'ATX', ram_slots: 4, max_ram_gb: 192 }, 'Топовый чипсет для энтузиастов: два слота PCIe 5.0 NVMe.'),
  c(14, 'motherboard', 'MSI', 'MSI PRO B760-P DDR4', 11990, 16, { socket: 'LGA1700', chipset: 'B760', memory_type: 'DDR4', form_factor: 'ATX', ram_slots: 4, max_ram_gb: 128 }, 'Бюджетная плата для процессоров Intel 12–14 поколений с DDR4.'),
  c(15, 'motherboard', 'ASUS', 'ASUS PRIME Z790-P WIFI', 21990, 8, { socket: 'LGA1700', chipset: 'Z790', memory_type: 'DDR5', form_factor: 'ATX', ram_slots: 4, max_ram_gb: 192 }, 'Z790 для разгона K-процессоров, DDR5 и Wi‑Fi 6E.'),

  // Оперативная память
  c(20, 'ram', 'Kingston', 'Kingston FURY Beast 16GB DDR4-3200', 3990, 40, { memory_type: 'DDR4', capacity_gb: 16, speed_mhz: 3200, modules: 2 }, 'Комплект 2×8 ГБ с низкими задержками и поддержкой XMP.'),
  c(21, 'ram', 'Corsair', 'Corsair Vengeance LPX 32GB DDR4-3600', 6990, 25, { memory_type: 'DDR4', capacity_gb: 32, speed_mhz: 3600, modules: 2 }, 'Набор 2×16 ГБ — достаточно для игр и работы с графикой.'),
  c(22, 'ram', 'Kingston', 'Kingston FURY Beast 16GB DDR5-5600', 6490, 30, { memory_type: 'DDR5', capacity_gb: 16, speed_mhz: 5600, modules: 2 }, 'Комплект DDR5 2×8 ГБ для современных платформ.'),
  c(23, 'ram', 'Corsair', 'Corsair Vengeance 32GB DDR5-6000', 11990, 19, { memory_type: 'DDR5', capacity_gb: 32, speed_mhz: 6000, modules: 2 }, 'Оптимальная частота для AMD EXPO и Intel XMP.'),
  c(24, 'ram', 'G.Skill', 'G.Skill Trident Z5 32GB DDR5-6400', 14990, 8, { memory_type: 'DDR5', capacity_gb: 32, speed_mhz: 6400, modules: 2 }, 'Высокочастотный комплект с радиаторами и RGB.'),
  c(25, 'ram', 'Crucial', 'Crucial 64GB DDR5-5600', 22990, 6, { memory_type: 'DDR5', capacity_gb: 64, speed_mhz: 5600, modules: 2 }, 'Объём для монтажа 4K, 3D-моделирования и виртуальных машин.'),

  // Видеокарты
  c(30, 'gpu', 'AMD', 'Sapphire PULSE Radeon RX 7600 8GB', 24990, 13, { chip: 'RX 7600', vram_gb: 8, tdp: 165, length_mm: 240 }, 'Отличная видеокарта для игр в Full HD на высоких настройках.'),
  c(31, 'gpu', 'NVIDIA', 'MSI GeForce RTX 4060 VENTUS 8GB', 27990, 20, { chip: 'RTX 4060', vram_gb: 8, tdp: 115, length_mm: 242 }, 'DLSS 3 и трассировка лучей при невысоком энергопотреблении.'),
  c(32, 'gpu', 'NVIDIA', 'Gigabyte GeForce RTX 4060 Ti 8GB', 36990, 12, { chip: 'RTX 4060 Ti', vram_gb: 8, tdp: 160, length_mm: 281 }, 'Комфортный Full HD и 1440p с Frame Generation.'),
  c(33, 'gpu', 'AMD', 'Sapphire NITRO+ Radeon RX 7800 XT 16GB', 51990, 6, { chip: 'RX 7800 XT', vram_gb: 16, tdp: 263, length_mm: 320 }, '16 ГБ видеопамяти для игр в 1440p без компромиссов.'),
  c(34, 'gpu', 'NVIDIA', 'ASUS DUAL GeForce RTX 4070 SUPER 12GB', 62990, 9, { chip: 'RTX 4070 SUPER', vram_gb: 12, tdp: 220, length_mm: 267 }, 'Баланс цены и производительности для 1440p и 4K с DLSS.'),
  c(35, 'gpu', 'NVIDIA', 'MSI GeForce RTX 4080 SUPER 16GB', 109990, 3, { chip: 'RTX 4080 SUPER', vram_gb: 16, tdp: 320, length_mm: 336 }, 'Мощь для 4K-гейминга и рендеринга на GPU.'),
  c(36, 'gpu', 'NVIDIA', 'ASUS ROG STRIX GeForce RTX 4090 24GB', 189990, 2, { chip: 'RTX 4090', vram_gb: 24, tdp: 450, length_mm: 357 }, 'Самая быстрая потребительская видеокарта в мире.'),

  // Накопители
  c(40, 'storage', 'Kingston', 'Kingston NV2 500GB NVMe', 3490, 50, { type: 'NVMe SSD', capacity_gb: 500, interface: 'M.2 PCIe 4.0' }, 'Быстрый SSD для системы и любимых игр.'),
  c(41, 'storage', 'Crucial', 'Crucial P3 1TB NVMe', 5990, 35, { type: 'NVMe SSD', capacity_gb: 1000, interface: 'M.2 PCIe 3.0' }, '1 ТБ NVMe по доступной цене.'),
  c(42, 'storage', 'Samsung', 'Samsung 980 1TB NVMe', 6990, 28, { type: 'NVMe SSD', capacity_gb: 1000, interface: 'M.2 PCIe 3.0' }, 'Проверенный временем накопитель с отличной надёжностью.'),
  c(43, 'storage', 'WD', 'WD Black SN850X 2TB NVMe', 15990, 14, { type: 'NVMe SSD', capacity_gb: 2000, interface: 'M.2 PCIe 4.0' }, 'Скорость чтения до 7300 МБ/с — загрузка игр за секунды.'),
  c(44, 'storage', 'Samsung', 'Samsung 990 PRO 2TB NVMe', 18990, 10, { type: 'NVMe SSD', capacity_gb: 2000, interface: 'M.2 PCIe 4.0' }, 'Флагманский SSD для требовательных профессионалов.'),
  c(45, 'storage', 'Seagate', 'Seagate BarraCuda 2TB HDD', 5290, 22, { type: 'HDD', capacity_gb: 2000, interface: 'SATA III' }, 'Ёмкий диск для хранения архивов и медиатеки.'),

  // Блоки питания
  c(50, 'psu', 'Chieftec', 'Chieftec Eco 500W', 3990, 30, { wattage: 500, certification: '80+ Bronze' }, 'Базовый блок питания для офисных конфигураций.'),
  c(51, 'psu', 'be quiet!', 'be quiet! System Power 10 650W', 5990, 26, { wattage: 650, certification: '80+ Bronze' }, 'Тихий и надёжный блок питания для игровых систем среднего уровня.'),
  c(52, 'psu', 'Corsair', 'Corsair RM750e 750W', 9990, 17, { wattage: 750, certification: '80+ Gold' }, 'Модульный блок 80+ Gold с тихим вентилятором.'),
  c(53, 'psu', 'DeepCool', 'DeepCool PQ850M 850W', 10990, 12, { wattage: 850, certification: '80+ Gold' }, 'Запас мощности для мощных видеокарт и разгона.'),
  c(54, 'psu', 'Seasonic', 'Seasonic FOCUS GX-1000 1000W', 17990, 5, { wattage: 1000, certification: '80+ Gold' }, 'Премиальный блок питания для топовых конфигураций.'),

  // Корпуса
  c(60, 'case', 'Zalman', 'Zalman S2 TG', 3990, 33, { form_factors: ['ATX', 'mATX', 'ITX'], max_gpu_length_mm: 350, color: 'Чёрный' }, 'Доступный корпус с закалённым стеклом и ARGB-вентиляторами.'),
  c(61, 'case', 'DeepCool', 'DeepCool CH360', 7490, 15, { form_factors: ['mATX', 'ITX'], max_gpu_length_mm: 320, color: 'Белый' }, 'Компактный корпус с отличной вентиляцией.'),
  c(62, 'case', 'NZXT', 'NZXT H5 Flow', 8990, 18, { form_factors: ['ATX', 'mATX', 'ITX'], max_gpu_length_mm: 365, color: 'Чёрный' }, 'Продуманный воздушный поток и аккуратная прокладка кабелей.'),
  c(63, 'case', 'Fractal Design', 'Fractal Design North', 13990, 7, { form_factors: ['ATX', 'mATX', 'ITX'], max_gpu_length_mm: 355, color: 'Дерево' }, 'Скандинавский дизайн с деревянной передней панелью.'),
  c(64, 'case', 'Lian Li', 'Lian Li O11 Dynamic EVO', 14990, 8, { form_factors: ['ATX', 'mATX', 'ITX'], max_gpu_length_mm: 420, color: 'Чёрный' }, 'Панорамный корпус для витрины ваших комплектующих.'),

  // Охлаждение
  c(70, 'cooler', 'be quiet!', 'be quiet! Pure Rock 2', 3290, 20, { sockets: ['AM4', 'AM5', 'LGA1700'], type: 'Башенный', tdp: 150 }, 'Тихий башенный кулер для процессоров до 150 Вт.'),
  c(71, 'cooler', 'DeepCool', 'DeepCool AK400', 2490, 45, { sockets: ['AM4', 'AM5', 'LGA1700'], type: 'Башенный', tdp: 220 }, 'Лидер по соотношению цены и эффективности.'),
  c(72, 'cooler', 'Thermalright', 'Thermalright Peerless Assassin 120', 3990, 16, { sockets: ['AM4', 'AM5', 'LGA1700'], type: 'Башенный', tdp: 250 }, 'Двухбашенный кулер, не уступающий жидкостным СО.'),
  c(73, 'cooler', 'Arctic', 'Arctic Liquid Freezer III 360', 10990, 6, { sockets: ['AM4', 'AM5', 'LGA1700'], type: 'СЖО 360 мм', tdp: 300 }, 'Эффективная жидкостная система охлаждения для топовых CPU.'),
]

export interface SeedBuild {
  id: number
  name: string
  slug: string
  description: string
  items: number[]
}

export const BUILDS: SeedBuild[] = [
  { id: 1, name: 'Старт 1080p', slug: 'start-1080p', description: 'Недорогой игровой компьютер для Full HD: идеален для киберспортивных дисциплин и современных новинок на средних настройках.', items: [1, 10, 20, 30, 41, 51, 60, 71] },
  { id: 2, name: 'Игровой Core', slug: 'igrovoy-core', description: 'Сбалансированная система на Intel с запасом по памяти. Уверенные 60+ FPS в большинстве игр на высоких настройках.', items: [5, 14, 21, 32, 42, 51, 62, 71] },
  { id: 3, name: 'Ryzen Compact', slug: 'ryzen-compact', description: 'Компактный и тихий ПК на платформе AM5 с DDR5. Помещается на стол и легко обновляется в будущем.', items: [2, 11, 22, 34, 41, 52, 61, 70] },
  { id: 4, name: 'Pro Streamer', slug: 'pro-streamer', description: 'Игры в 1440p и стриминг одновременно: 8 ядер с 3D V-Cache, 16 ГБ видеопамяти и быстрый SSD на 2 ТБ.', items: [3, 12, 23, 33, 43, 53, 63, 72] },
  { id: 5, name: 'Intel Ultra', slug: 'intel-ultra', description: 'Мощная конфигурация на Intel Core i5 K-серии для тех, кто любит разгон и максимальные настройки.', items: [6, 15, 24, 34, 43, 53, 62, 73] },
  { id: 6, name: 'Creator 4K', slug: 'creator-4k', description: 'Рабочая станция и флагманский игровой ПК: 16 ядер, 64 ГБ памяти и RTX 4080 SUPER для 4K и рендеринга.', items: [4, 13, 25, 35, 44, 54, 64, 73] },
]
