import type { APIRoute } from 'astro';
import { parseGitRepo } from '../../scripts/gitParser';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { repoUrl } = body;
    
    if (!repoUrl) {
      return new Response(JSON.stringify({ 
        error: 'URL del repository richiesto' 
      }), { status: 400 });
    }

    console.log('Inizio analisi del repository:', repoUrl);
    const classes = await parseGitRepo(repoUrl);
    
    // Ordina le classi
    const sortedClasses = Array.from(classes).sort();
    
    console.log('Analisi completata:', sortedClasses.length, 'classi trovate');
    
    return new Response(JSON.stringify({ 
      classes: sortedClasses,
      totalClasses: sortedClasses.length
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (e) {
    console.error('Errore durante l\'analisi:', e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : 'Errore sconosciuto' 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};