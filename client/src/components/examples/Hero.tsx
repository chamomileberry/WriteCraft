import Hero from "../Hero";
import { useLocation } from "wouter";

export default function HeroExample() {
  const [, setLocation] = useLocation();

  return <Hero onNavigate={setLocation} />;
}
