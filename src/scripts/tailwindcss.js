// src/scripts/tailwind.js
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');

async function parseTailwindClasses(cssContent) {
  const result = await postcss([tailwindcss])
    .process(cssContent, { from: undefined });
  const classes = new Set();

  result.root.walkRules(rule => {
    rule.selector.split(' ').forEach(selector => {
      if (selector.startsWith('.')) {
        classes.add(selector.substring(1));
      }
    });
  });

  return Array.from(classes);
}

module.exports = { parseTailwindClasses };
