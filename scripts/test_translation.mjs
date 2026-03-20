
function translateToSpanish(englishName) {
  const name = englishName.toLowerCase()
  const reverseMap = {
    'wheat flour': 'Harina de trigo',
    'sugar': 'Azúcar',
    'honey': 'Miel',
    'salt': 'Sal',
    'olive oil': 'Aceite de oliva',
    'butter': 'Mantequilla',
    'milk': 'Leche',
    'cheese': 'Queso',
    'egg': 'Huevo',
    'chicken': 'Pollo',
    'beef': 'Carne de res',
    'pork': 'Cerdo',
    'fish': 'Pescado',
    'rice': 'Arroz',
    'pasta': 'Pasta',
    'bread': 'Pan',
    'vanilla': 'Vainilla',
    'cocoa': 'Cacao',
    'chocolate': 'Chocolate',
    'almond': 'Almendra',
    'oats': 'Avena',
    'corn': 'Maíz',
    'potato': 'Papa',
    'carrot': 'Zanahoria',
    'onion': 'Cebolla',
    'garlic': 'Ajo',
    'broccoli': 'Brócoli',
    'tomatoes': 'Tomates',
    'tomato': 'Tomate',
    'canned': 'en conserva',
    'raw': 'crudo',
    'diced': 'en cubos',
    'ripe': 'maduro',
    'red': 'rojo',
    'grape': 'grape (uvas)',
    'carrot,': 'Zanahoria,',
  }

  const sortedEng = Object.keys(reverseMap).sort((a, b) => b.length - a.length)

  for (const eng of sortedEng) {
    if (name.includes(eng)) {
      const esp = reverseMap[eng]
      let replaced = name.replace(eng + 'es', esp + 's') 
      if (replaced === name) replaced = name.replace(eng + 's', esp + 's') 
      if (replaced === name) replaced = name.replace(eng, esp)
      return replaced.charAt(0).toUpperCase() + replaced.slice(1)
    }
  }
  return englishName.charAt(0).toUpperCase() + englishName.slice(1)
}

console.log('Result 1 (Tomatoes):', translateToSpanish('Tomatoes, canned, red, ripe, diced'));
console.log('Result 2 (Tomato):', translateToSpanish('Tomato, raw'));
