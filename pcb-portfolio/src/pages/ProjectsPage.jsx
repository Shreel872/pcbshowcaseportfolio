import HeroSection from "../components/landing/HeroSection";
import FeaturedProject from "../components/landing/FeaturedProject";
import EngineeringApproach from "../components/landing/EngineeringApproach";

export default function ProjectsPage() {
  return (
    <div>
      <HeroSection />
      <div className="border-t border-gray-800/60" />
      <FeaturedProject />
      <div className="border-t border-gray-800/60" />
      <EngineeringApproach />
    </div>
  );
}
