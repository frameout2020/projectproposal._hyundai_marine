# HTML + SCSS + Gulp Scaffold

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run deploy`

## Structure

- `src/index.html`: page entry
- `src/scss`: Sass source files
- `src/assets`: images, fonts, and JavaScript
- `dist`: compiled output
- `docs`: GitHub Pages publishing output

## Notes

This scaffold is prepared so a Figma screen can be implemented directly into a static HTML workflow.
Run `npm run build` before publishing so both `dist` and `docs` stay up to date.
For GitHub Pages on a `deploy` branch, run `npm run deploy` and set Pages to `Deploy from a branch > deploy > /(root)`.
