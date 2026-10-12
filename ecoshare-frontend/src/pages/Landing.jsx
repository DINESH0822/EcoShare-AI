import React from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  ShieldCheck,
  Cpu,
  Truck,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Users,
  Compass,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#06111F] text-[#F1F5F9] font-sans selection:bg-[#10B981]/30">
      {/* Top Navigation */}
      <header className="border-b border-[#20364D]/70 bg-[#071525]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#3B82F6] flex items-center justify-center text-white shadow-lg shadow-[#10B981]/20">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#F1F5F9]">
                EcoShare <span className="text-[#10B981]">AI</span>
              </span>
              <span className="block text-[10px] tracking-wider uppercase font-semibold text-[#9CAFC3]">
                Intelligent Food Rescue Network
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#9CAFC3]">
            <a href="#how-it-works" className="hover:text-[#F1F5F9] transition-colors">
              How It Works
            </a>
            <a href="#food-safety" className="hover:text-[#F1F5F9] transition-colors">
              Food Safety
            </a>
            <a href="#ai-engine" className="hover:text-[#F1F5F9] transition-colors">
              AI Matching
            </a>
            <a href="#impact" className="hover:text-[#F1F5F9] transition-colors">
              Impact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-[#F1F5F9] hover:bg-[#122840] transition-colors border border-transparent hover:border-[#20364D]"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#10B981] text-[#06111F] hover:bg-[#10B981]/90 shadow-md shadow-[#10B981]/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#122840] border border-[#20364D] text-[#10B981] mb-6">
            <Cpu className="w-3.5 h-3.5" />
            <span>Explainable AI & Machine Learning Logistics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F1F5F9] max-w-4xl mx-auto leading-tight">
            Connecting surplus food to verified rescue organizations in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#3B82F6] to-[#8B5CF6]">
              real time.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#9CAFC3] max-w-2xl mx-auto leading-relaxed">
            EcoShare AI eliminates hunger and reduces landfill emissions through supervised
            ML claim matching, cold-chain compliance verification, and transparent operations tracking.
          </p>

          {/* Role CTA Split */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/donor/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-[#10B981] text-[#06111F] hover:bg-[#10B981]/90 transition-all shadow-lg shadow-[#10B981]/25"
            >
              <span>Donate Surplus Food</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/ngo/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-[#0D1E31] text-[#F1F5F9] border border-[#20364D] hover:bg-[#122840] hover:border-[#3B82F6]/50 transition-all"
            >
              <span>Join as Verified NGO</span>
              <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-[#0D1E31]/70 border border-[#20364D] rounded-xl p-4">
              <div className="text-2xl font-black text-[#10B981]">100%</div>
              <div className="text-xs text-[#9CAFC3] mt-1 font-medium">Traceable End-to-End</div>
            </div>
            <div className="bg-[#0D1E31]/70 border border-[#20364D] rounded-xl p-4">
              <div className="text-2xl font-black text-[#3B82F6]">&lt; 30 min</div>
              <div className="text-xs text-[#9CAFC3] mt-1 font-medium">Average Dispatch Window</div>
            </div>
            <div className="bg-[#0D1E31]/70 border border-[#20364D] rounded-xl p-4">
              <div className="text-2xl font-black text-[#8B5CF6]">Random Forest</div>
              <div className="text-xs text-[#9CAFC3] mt-1 font-medium">Claim Success Predictor</div>
            </div>
            <div className="bg-[#0D1E31]/70 border border-[#20364D] rounded-xl p-4">
              <div className="text-2xl font-black text-[#F59E0B]">FSSAI Aligned</div>
              <div className="text-xs text-[#9CAFC3] mt-1 font-medium">Food Safety Declarations</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-[#071525]/60 border-t border-[#20364D]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
              Verified Lifecycle
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#F1F5F9] mt-2">
              From Kitchen Surplus to Community Meals
            </h2>
            <p className="text-sm text-[#9CAFC3] mt-3">
              One unbroken lifecycle managed by atomic database updates, real-time dispatch, and audited handoffs.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-6 relative">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-[#F1F5F9]">Publish Donation</h3>
              <p className="text-xs text-[#9CAFC3] mt-2 leading-relaxed">
                Donor logs quantity, category, preparation time, cold storage needs, and validated GPS coordinates.
              </p>
            </div>

            <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-6 relative">
              <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-[#F1F5F9]">AI/ML Matching</h3>
              <p className="text-xs text-[#9CAFC3] mt-2 leading-relaxed">
                Rules engine verifies NGO operating hours & capacity, while our ML model ranks claim likelihood.
              </p>
            </div>

            <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-6 relative">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-[#F1F5F9]">Verified NGO Claim</h3>
              <p className="text-xs text-[#9CAFC3] mt-2 leading-relaxed">
                Verified NGO reviews safety parameters and claims surplus; operation dispatch triggers instantly.
              </p>
            </div>

            <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-6 relative">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-[#F1F5F9]">Pickup & Delivery</h3>
              <p className="text-xs text-[#9CAFC3] mt-2 leading-relaxed">
                Driver records timestamped proof of collection and delivery, completing the food safety audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Food Safety & FSSAI Guidelines */}
      <section id="food-safety" className="py-20 border-t border-[#20364D]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0D1E31] to-[#122840] border border-[#20364D] rounded-2xl p-8 sm:p-12">
            <div className="flex items-center gap-3 text-[#F59E0B]">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Food Safety & Regulatory Compliance
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mt-3">
              FSSAI-Aligned Surplus Food Handling Principles
            </h3>
            <p className="text-sm text-[#9CAFC3] mt-3 max-w-3xl leading-relaxed">
              EcoShare AI requires all participating donors and NGOs to declare temperature controls, allergen flags,
              and strict consumption deadlines. Note: The platform facilitates operational tracking but does not replace
              official food inspections or statutory duties under the Food Safety and Standards Act.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#06111F]/60 border border-[#20364D]/60 rounded-xl p-4">
                <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  Hot & Cold Holding Checks
                </div>
                <p className="text-xs text-[#9CAFC3] mt-1.5">
                  Cooked meals must remain above 65°C or chilled below 5°C with documented storage details.
                </p>
              </div>

              <div className="bg-[#06111F]/60 border border-[#20364D]/60 rounded-xl p-4">
                <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  Mandatory Allergen Labeling
                </div>
                <p className="text-xs text-[#9CAFC3] mt-1.5">
                  Every donation must explicitly declare nuts, dairy, gluten, and vegetarian or non-vegetarian status.
                </p>
              </div>

              <div className="bg-[#06111F]/60 border border-[#20364D]/60 rounded-xl p-4">
                <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  Strict Expiry Enforcements
                </div>
                <p className="text-xs text-[#9CAFC3] mt-1.5">
                  Donations expiring within 60 minutes escalate to Critical status; past-due items are automatically expired.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#20364D]/70 bg-[#071525] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center text-[#06111F] font-bold">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-[#F1F5F9]">EcoShare AI</span>
            <span className="text-xs text-[#9CAFC3]">
              © {new Date().getFullYear()} Intelligent Food Rescue System
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#9CAFC3]">
            <Link to="/login" className="hover:text-[#F1F5F9]">
              Portal Login
            </Link>
            <Link to="/organizations" className="hover:text-[#F1F5F9]">
              NGO Directory
            </Link>
            <Link to="/sustainability" className="hover:text-[#F1F5F9]">
              Sustainability Methodology
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
