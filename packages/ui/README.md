# @ssii-ia/ui

Design System pour la plateforme SSII IA - Librairie de composants UI réutilisables basée sur shadcn/ui avec customisations.

## Installation

```bash
npm install @ssii-ia/ui
```

## Composants

### Primitives
Composants de base basés sur Radix UI et shadcn/ui :
- Button
- Card
- Dialog
- Input
- Label
- Separator
- Switch
- Table
- Textarea

### Feedback
Composants pour le feedback utilisateur :
- Alert
- Badge
- Progress
- Spinner
- StatusDot

### Layout
Composants de mise en page :
- Container
- Grid
- Stack
- Divider

### Data
Composants pour la gestion des données :
- DataTable (avec tri, filtres, pagination)
- EmptyState
- Pagination
- SearchBar

### Charts
Graphiques avec Recharts :
- AreaChart
- BarChart
- LineChart
- PieChart

### Business
Composants métier spécifiques :
- AgentCard
- MetricCard
- ProjectCard
- CodeBlock
- Terminal
- StepIndicator

## Utilisation

```tsx
import {
  Button,
  Card,
  AgentCard,
  DataTable,
  LineChart
} from '@ssii-ia/ui';

// Utilisation
<Button variant="gradient" size="lg">
  Click me
</Button>

<AgentCard
  name="Agent Analyzer"
  description="Analyse de code"
  status="running"
  progress={75}
  icon={<CodeIcon />}
/>
```

## Thème

Le design system inclut un système de thème complet :

```tsx
import { colors, typography, spacing, animations } from '@ssii-ia/ui';

// Utiliser les tokens de design
const primaryColor = colors.primary[500];
const headingStyle = typography.textStyles.h1;
```

## Hooks

Hooks personnalisés inclus :
- `useTheme` - Gestion du thème (light/dark)
- `useMediaQuery` - Media queries responsive
- `useDebounce` - Debounce de valeurs
- `useCopyToClipboard` - Copie dans le clipboard

## Development

```bash
# Installer les dépendances
npm install

# Build
npm run build

# Dev mode (watch)
npm run dev
```

## License

MIT
