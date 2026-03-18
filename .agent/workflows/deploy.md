---
description: Deploy automático a Vercel vía GitHub — ejecutar siempre después de cualquier cambio de código
---

# Regla de oro del proyecto NUTRIETIQ
> **Este proyecto está en deploy continuo en Vercel.**  
> Cada cambio de código DEBE terminar con un commit y push a GitHub.  
> Vercel detecta el push automáticamente y despliega en ~2 minutos.

## Pasos obligatorios después de cualquier cambio

// turbo-all
1. Hacer stage de todos los archivos modificados:
```
git add -A
```

// turbo-all
2. Commit con mensaje descriptivo:
```
git commit -m "descripción del cambio"
```

// turbo-all
3. Push a la rama main:
```
git push
```

## Comando combinado (preferido)

// turbo-all
```bash
cd /home/francisco/Documentos/FVC-personales/DESARROLLO-2026/NUTRIETIQ && git add -A && git commit -m "<mensaje>" && git push
```

## Notas
- Stack: Next.js · Supabase · Vercel · GitHub
- Rama principal: `main`
- URL producción: https://nutrietiq.vercel.app
- No se necesita build manual — Vercel lo hace automáticamente al recibir el push.
