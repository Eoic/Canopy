// // // New cell:
// // // 1. Create post.
// // // 3. Copy position.

// // import { Application, Graphics } from 'pixi.js';
// // import { Vector } from '../math/vector';
// // import { CELL_HALF_SIZE, CELL_LINE_WIDTH } from '../constants';
// // import { Layers } from '../layers';
// // import { SVG } from 'pixi-svg';

// // // Existing cell - not owned.
// // // 1. Reply.
// // // 2. Share.
// // // 3. Copy position.

// // // Existing cell - owned.
// // // 1. Edit.
// // // 2. Delete.
// // // 3. Copy position.

// // export type RadialMenuItem = {
// //     color: string;
// // };

// export class RadialMenu {
//     private _items: RadialMenuItem[] = [];

//     constructor(items: RadialMenuItem[]) {
//         this._items = items;
//     }

//     public static build(): Graphics {
//         const items = [
//             { icon: 'circle-plus' }
//             // { icon: 'share' },
//             // { icon: 'thumbtrack' },
//             // { icon: 'map-location-dot' }
//         ];

//         const graphics = new Graphics();

//         graphics.beginFill(0xAA4F08, 0.15);
//         graphics.drawEllipse(0, 0, CELL_HALF_SIZE - CELL_LINE_WIDTH, CELL_HALF_SIZE - CELL_LINE_WIDTH);
//         graphics.endFill();

//         const radius = (CELL_HALF_SIZE - CELL_LINE_WIDTH);
//         const center = { x: 0, y: 0 };
//         const step = 2 * Math.PI / items.length;

//         for (let i = 0; i < items.length; i++) {
//             const icon = new SVG(document.querySelector(`#icons ${items[i].icon}`));
//             icon.zIndex = Layers.MenuFG;
//             icon.width = 100;
//             icon.height = 100;
//             console.log(icon);

//             graphics.addChild(icon);

//             const position = {
//                 x: center.x + radius * Math.cos(i * step),
//                 y: center.y + radius * Math.sin(i * step),
//             };
//             icon.position.set(position.x, position.y);

//             graphics.beginFill(0x2F2F2F, 0.85);
//             graphics.drawCircle(position.x, position.y, 15);
//             graphics.zIndex = Layers.MenuBG;
//             graphics.endFill();
//         }

//         return graphics;
//     }
// };
