import { launchRecipes } from '../../data/recipes';
import { PlannerApp } from '@/components/planner-app';

export default function HomePage() {
  return <PlannerApp recipes={launchRecipes} />;
}
