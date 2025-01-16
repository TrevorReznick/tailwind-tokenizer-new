import { simpleGit } from 'simple-git';
import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

export async function parseGitRepo(repoUrl: string) {

  const tempBaseDir = path.join(process.cwd(), '..', '.git-temp');
  const tempDirName = crypto.randomBytes(16).toString('hex');
  const tempDir = path.join(tempBaseDir, tempDirName);
  
  try {
    // Crea la directory temporanea
    await fsPromises.mkdir(tempBaseDir, { recursive: true })
    
    // Clona il repository
    const git = simpleGit();
    console.log('Clonazione del repository...')
    await git.clone(repoUrl, tempDir, ['--depth', '1'])

    // Trova e analizza i file
    console.log('Scansione dei file...')
    const files = findFilesSync(tempDir)
    console.log(`Trovati ${files.length} file da analizzare`)
    
    // Estrai le classi
    const tailwindClasses = await extractTailwindClasses(files)
    console.log(`Estratte ${tailwindClasses.size} classi uniche`)
    
    return tailwindClasses
  } catch (error) {
    console.error('Errore durante l\'analisi:', error);
    throw error;
  } finally {
    // Pulizia
    try {
      if (fs.existsSync(tempDir)) {
        await fsPromises.rm(tempDir, { recursive: true, force: true });
        console.log('Directory temporanea rimossa');
      }
    } catch (e) {
      console.error('Errore durante la pulizia:', e);
    }
  }
}

function findFilesSync(dir: string): string[] {
  const files: string[] = [];
  const extensions = new Set(['.jsx', '.tsx', '.astro', '.html', '.vue', '.svelte']);
  
  function scan(directory: string) {
    try {
      const entries = fs.readdirSync(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        // Ignora node_modules e .git
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            scan(fullPath);
          }
        } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
          files.push(fullPath);
        }
      }
    } catch (e) {
      console.error(`Errore durante la scansione di ${directory}:`, e);
    }
  }
  
  scan(dir);
  return files;
}

async function extractTailwindClasses(files: string[]): Promise<Set<string>> {
  const classSet = new Set<string>();
  const patterns = [
    /class(Name)?=["']([^"']*)["']/g,           // class="..." o className="..."
    /class(Name)?\{{2}([^}]*)\}{2}/g,           // class={{...}}
    /:class=["']([^"']*)["']/g,                 // Vue :class="..."
    /\bclass:\w+\s*=\s*["']([^"']*)["']/g,      // Svelte class:name="..."
    /classes:?\s*=\s*["']([^"']*)["']/g         // classes="..."
  ];
  
  for (const file of files) {
    try {
      const content = await fsPromises.readFile(file, 'utf-8');
      
      for (const regex of patterns) {
        let match;
        while ((match = regex.exec(content)) !== null) {
          const classes = (match[2] || match[1] || '').split(/\s+/);
          classes.forEach(cls => {
            const trimmed = cls.trim();
            if (trimmed && !trimmed.includes('${') && !trimmed.includes('{') && !trimmed.includes('}')) {
              classSet.add(trimmed);
            }
          });
        }
      }
    } catch (e) {
      console.error(`Errore durante l'analisi del file ${file}:`, e)
    }
  }
  
  return classSet
}