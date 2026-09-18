# Regla de Oro: Prohibición Estricta de Git Sin Autorización Expresa

> [!CAUTION]
> **REGLA DE CUMPLIMIENTO OBLIGATORIO — SIN EXCEPCIONES**

## Principios Innegociables

1. **PROHIBIDO INFERIR O HEREDAR PERMISOS DE GIT:**
   - La aprobación de un `git commit` o `git push` previo aplica **ÚNICAMENTE** a ese evento específico.
   - Jamás asumir que un permiso concedido para una tarea autoriza a realizar commits o pushes posteriores, sin importar lo menor o inofensivo que parezca el cambio (incluyendo archivos de documentación como `.md`, `.json`, logs o especificaciones).

2. **REQUERIMIENTO DE CONFIRMACIÓN EXPLÍCITA:**
   - Cada comando `git commit` y cada comando `git push` requiere una instrucción verbal explícita del usuario en el turno actual (ej: *"hacé commit"*, *"push"*, *"hacé el push"*).
   - Frases como *"ok"*, *"adelante"*, *"armalo"*, *"hacelo"*, *"listo"* o *"procedé"* significan **exclusivamente implementar o editar el código**, **JAMÁS** ejecutar `git commit` ni `git push`.
   - En ausencia de esa autorización exacta en el turno actual, el agente debe **DETENERSE**, presentar el estado de los archivos y esperar la orden del usuario.

3. **VERIFICACIÓN INTERACTIVA DE COMANDOS:**
   - Nunca encadenar comandos `git commit && git push` automáticamente a menos que el usuario lo haya ordenado explícitamente en el mismo mensaje.
