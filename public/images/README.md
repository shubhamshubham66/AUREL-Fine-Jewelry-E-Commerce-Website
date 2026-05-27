# Product Images

Drop your local product images into this folder. They will be served at
`/images/your-file.png` in dev and at the correct base path on GitHub Pages
(handled automatically by `src/utils/assets.js`).

## Recommended file naming

| Product             | Suggested file               |
|---------------------|------------------------------|
| Eternal Solitaire   | `eternal-solitaire.jpg`      |
| Celestia Pendant    | `celestia-pendant.jpg`       |
| Aurora Drops        | `aurora-drops.jpg`           |
| Monarch Tennis      | `monarch-tennis.jpg`         |
| Lumière Halo        | `lumiere-halo.jpg`           |
| Opera Pearl         | `opera-pearl.jpg`            |
| Cassia Studs        | `cassia-studs.jpg`           |
| Sovereign Cuff      | `sovereign-cuff.jpg`         |

## Specifications
- **Format:** JPG / PNG / WEBP
- **Aspect ratio:** Square (1:1) recommended
- **Size:** 800 × 800 px or larger
- **File size:** Keep under 300 KB for fast loading

## Using local images

Once you've added a file, update `src/data/products.js` to reference it:

```js
import { image } from '../utils/assets.js';

// Local image (in this folder)
image: image('eternal-solitaire.jpg'),

// Or external URL (still works, passed through)
image: 'https://images.unsplash.com/...'
```

The `image()` helper automatically prefixes the GitHub Pages base path so
images load correctly in production.
