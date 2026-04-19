import HeroSection from "../components/landing/HeroSection";
import FeaturedProjects from "../components/landing/FeaturedProjects";
import EngineeringApproach from "../components/landing/EngineeringApproach";

export default function ProjectsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <HeroSection />
      <FeaturedProjects />
      <EngineeringApproach />
    </div>
  );
}
