interface TailwindConfig {
    colors?: Record<string, string | Record<string, string>>;
    spacing?: Record<string, string>;
    breakpoints?: Record<string, string>;
    // Aggiungi altre proprietà secondo necessità
}

export function parseTailwindConfig(content: string): TailwindConfig {
    // Implementazione più robusta del parsing
    const config: TailwindConfig = {}
    
    // Parsing dei colori
    const colorMatch = content.match(/colors:\s*{([^}]+)}/s)
    if (colorMatch) {
      config.colors = parseObjectLiteral(colorMatch[1])
    }
  
    // Parsing dello spacing
    const spacingMatch = content.match(/spacing:\s*{([^}]+)}/s)
    if (spacingMatch) {
      config.spacing = parseObjectLiteral(spacingMatch[1])
    }
  
    // Parsing dei breakpoints
    const breakpointsMatch = content.match(/screens:\s*{([^}]+)}/s)
    if (breakpointsMatch) {
      config.breakpoints = parseObjectLiteral(breakpointsMatch[1])
    }
  
    // Aggiungere qui altri parsing necessari
  
    return config
}
  
function parseObjectLiteral(literal: string) {
    const result: any = {}
    const pairs = literal.match(/['"]?(\w+)['"]?\s*:\s*(['"]?\w+['"]?|{[^}]+})/g) || []
    
    pairs.forEach(pair => {
        const [key, value] = pair.split(':').map(s => s.trim().replace(/['"]/g, ''))
        if (value.startsWith('{')) {
            result[key] = parseObjectLiteral(value.slice(1, -1))
        } else {
            result[key] = value
        }
    })
  
    return result
}