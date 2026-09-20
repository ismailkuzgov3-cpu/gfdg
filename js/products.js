const DEFAULT_PRODUCTS = [
  { id:1, name:"Газовый котёл Baxi Eco Four 24F", category:"Котлы", price:78000, oldPrice:89000,
    img:"https://picsum.photos/seed/boiler1/400/300", desc:"24 кВт, двухконтурный, турбированный" },
  { id:2, name:"Котёл Navien DELUXE 16K", category:"Котлы", price:52000, oldPrice:60000,
    img:"https://picsum.photos/seed/boiler2/400/300", desc:"16 кВт, двухконтурный" },
  { id:3, name:"Электрический котёл Bosch 18 кВт", category:"Котлы", price:41000, oldPrice:0,
    img:"https://picsum.photos/seed/boiler3/400/300", desc:"Электрокотёл, 18 кВт" },

  { id:4, name:"Радиатор биметалл Royal Thermo 500", category:"Радиаторы", price:6500, oldPrice:7200,
    img:"https://picsum.photos/seed/radiator1/400/300", desc:"10 секций, 500 мм" },
  { id:5, name:"Радиатор алюминиевый 500мм", category:"Радиаторы", price:4200, oldPrice:0,
    img:"https://picsum.photos/seed/radiator2/400/300", desc:"8 секций" },
  { id:6, name:"Радиатор стальной панельный 500x1000", category:"Радиаторы", price:8900, oldPrice:0,
    img:"https://picsum.photos/seed/radiator3/400/300", desc:"Стальной, 500x1000" },

  { id:7, name:"Труба PPR 25мм (2м)", category:"Трубы", price:320, oldPrice:0,
    img:"https://picsum.photos/seed/pipe1/400/300", desc:"Полипропиленовая" },
  { id:8, name:"Труба металлопластик 16мм", category:"Трубы", price:180, oldPrice:0,
    img:"https://picsum.photos/seed/pipe2/400/300", desc:"За метр" },

  { id:9, name:"Циркуляционный насос Grundfos 25-40", category:"Насосы", price:18500, oldPrice:21000,
    img:"https://picsum.photos/seed/pump1/400/300", desc:"Grundfos Alpha" },
  { id:10, name:"Насос Wilo Star-RS 25/6", category:"Насосы", price:14200, oldPrice:0,
    img:"https://picsum.photos/seed/pump2/400/300", desc:"Wilo" },

  { id:11, name:"Терморегулятор радиатора Danfoss", category:"Автоматика", price:2800, oldPrice:0,
    img:"https://picsum.photos/seed/thermo1/400/300", desc:"Термоголовка" },
  { id:12, name:"Термостат комнатный программируемый", category:"Автоматика", price:5600, oldPrice:6400,
    img:"https://picsum.photos/seed/thermo2/400/300", desc:"Недельный программатор" },

  { id:13, name:"Бойлер косвенного нагрева 100л", category:"Бойлеры", price:32000, oldPrice:0,
    img:"https://picsum.photos/seed/boiler-tank1/400/300", desc:"100 литров" },
  { id:14, name:"Водонагреватель накопительный 50л", category:"Бойлеры", price:17500, oldPrice:19000,
    img:"https://picsum.photos/seed/boiler-tank2/400/300", desc:"Электрический" },

  { id:15, name:"Кран шаровой 1/2", category:"Комплектующие", price:850, oldPrice:0,
    img:"https://picsum.photos/seed/valve1/400/300", desc:"Латунный" },
  { id:16, name:"Расширительный бак 12л", category:"Комплектующие", price:3400, oldPrice:0,
    img:"https://picsum.photos/seed/tank1/400/300", desc:"Для отопления" },
];

function initProducts() {
  if (!localStorage.getItem('cc_products')) {
    localStorage.setItem('cc_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
}
function getProducts() {
  return JSON.parse(localStorage.getItem('cc_products') || '[]');
}
function saveProducts(list) {
  localStorage.setItem('cc_products', JSON.stringify(list));
}
initProducts();