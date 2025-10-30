## 🚀 Nomenclature des noms de branches

Les branches doivent décrire leur objectif. Utilise un **préfixe** suivi d’un **slug** clair et concis.

### 📂 Types de branches :

| Type     | Préfixe     | Exemple                           |
| -------- | ----------- | --------------------------------- |
| Feature  | `feature/`  | `feature/user-authentication`     |
| Bug fix  | `fix/`      | `fix/login-redirect-bug`          |
| Hotfix   | `hotfix/`   | `hotfix/crash-on-startup`         |
| Refactor | `refactor/` | `refactor/user-service-structure` |
| Chore    | `chore/`    | `chore/update-dependencies`       |
| Test     | `test/`     | `test/add-login-unit-tests`       |
| Docs     | `docs/`     | `docs/api-auth-docs`              |
| Release  | `release/`  | `release/v1.0.0`                  |

**Bonus :** Ajoute un identifiant de ticket si tu travailles avec un outil comme Jira, Notion ou Linear :

```
feature/1234-user-authentication
fix/BUG-982-login-crash
```

---

## 📝 Nomenclature des messages de commit

Utilise le **format conventionnel** `type(scope): message`, inspiré de [Conventional Commits](https://www.conventionalcommits.org/), très apprécié dans les projets pro, surtout avec les outils d’intégration continue (CI/CD).

### 🔠 Types courants de commits

| Type       | Utilisation                                            | Exemple                                         |
| ---------- | ------------------------------------------------------ | ----------------------------------------------- |
| `feat`     | Nouvelle fonctionnalité                                | `feat(auth): add GitHub OAuth login`            |
| `fix`      | Correction de bug                                      | `fix(api): prevent crash on empty payload`      |
| `docs`     | Changement de documentation                            | `docs(readme): add usage instructions`          |
| `style`    | Changement sans impact sur le code (indentation, etc.) | `style(ui): reindent login form`                |
| `refactor` | Refactoring sans changement fonctionnel                | `refactor(db): simplify user query`             |
| `perf`     | Amélioration des performances                          | `perf(api): reduce response time for dashboard` |
| `test`     | Ajout ou mise à jour de tests                          | `test(user): add signup unit tests`             |
| `chore`    | Tâches diverses (build, dépendances, scripts, etc.)    | `chore: update eslint config`                   |
| `ci`       | Configuration de l’intégration continue                | `ci(github): add action for test coverage`      |

### 🎯 Bonnes pratiques

* **Présent** : Utilise l’impératif présent → `add`, `fix`, `update` (pas `added` ou `adds`)
* **Court et clair** : Max 50-60 caractères pour le titre
* **Optionnel** : Ajoute une description en dessous si nécessaire

```bash
git commit -m "feat(profile): add profile picture upload"

# ou avec un corps :
git commit -m "fix(auth): handle empty token on refresh" -m "Previously, the app crashed when the token was null. This ensures a fallback redirect."
```
