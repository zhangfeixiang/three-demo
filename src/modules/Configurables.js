// 可替换对象配置
var Configurables = [{
  name: 'fauteuil',
  linkedObjects: ['seat_main'],
  panel_data: {
    name: 'OSCAR',
    type: 'LOUNGE SEAT',
    dimensions: '100 x 94 x 97 厘米',
    materials: ['Blue Leather', 'Grey Knit Fabric', 'Blue Knit Fabric', 'Dark Grey Cotton']
  },
  minDistance: 1,
  maxDistance: 2
},
{
  name: 'fauteuil2',
  linkedObjects: ['seat_main'],
  panel_data: {
    name: 'OSCAR',
    type: 'LOUNGE SEAT',
    dimensions: '100 x 94 x 97 厘米',
    materials: ['Blue Leather', 'Grey Knit Fabric', 'Blue Knit Fabric', 'Dark Grey Cotton']
  },
  minDistance: 1,
  maxDistance: 2
},
{
  name: 'table',
  linkedObjects: ['table_top'],
  panel_data: {
    name: 'CHLOE',
    type: 'DINING TABLE',
    dimensions: '180 x 90 x 75 厘米',
    materials: ['Ash Wood', 'Walnut', 'Grey Blue Granite', 'Painted Metal']
  },
  minDistance: 1.65,
  maxDistance: 2.55
},
{
  name: 'coffee_table',
  linkedObjects: ['board'],
  panel_data: {
    name: 'ELENA',
    type: 'COFFEE TABLE',
    dimensions: '120 x 120 x 35 厘米',
    materials: ['Natural Beech Wood', 'Vintage Plastic', 'Glossy White', 'Polished Copper']
  },
  minDistance: 0.95,
  maxDistance: 1.6
},
{
  name: 'canape',
  linkedObjects: ['sofa_main'],
  panel_data: {
    name: 'BARNEY',
    type: '休闲沙发',
    dimensions: '274 x 95 x 83 厘米',
    materials: ['白色牛皮', '棕色牛皮', '灰色布艺', '深灰色棉绒']
  },
  minDistance: 2,
  maxDistance: 3
},
{
  name: 'suspended_lamp',
  linkedObjects: ['suspended_lamp'],
  panel_data: {
    name: 'SARAH',
    type: 'PENDANT LAMP',
    dimensions: '35 x 35 x 30 厘米',
    materials: ['Black & Gold', 'Glossy White', 'Glossy Blue', 'Yellow Rubber']
  },
  minDistance: 1,
  maxDistance: 2
}]
export default Configurables
