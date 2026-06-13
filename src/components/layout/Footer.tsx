import { Link } from "wouter";
import { Zap, Shield, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-display text-2xl font-bold tracking-tight text-primary">
                Adhunik<span className="text-foreground font-light">Electric</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium electrical components and industrial grade precision tools. Serving contractors, electricians, and retail customers with uncompromised quality.
            </p>
            <div className="flex space-x-4 pt-2">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Catalog links */}
          <div>
            <h3 className="font-display text-base font-semibold mb-6">Product Catalog</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/products?categoryId=circuit-breakers" className="text-muted-foreground hover:text-primary transition-colors">
                  Circuit Breakers
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=cables-wires" className="text-muted-foreground hover:text-primary transition-colors">
                  Cables & Wires
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=switches-sockets" className="text-muted-foreground hover:text-primary transition-colors">
                  Switches & Sockets
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=led-lighting" className="text-muted-foreground hover:text-primary transition-colors">
                  LED Lighting
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display text-base font-semibold mb-6">Customer Service</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-muted-foreground hover:text-primary transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-muted-foreground hover:text-primary transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 text-sm text-muted-foreground">
            <h3 className="font-display text-base font-semibold text-foreground mb-6">Get In Touch</h3>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>near V-mart Overbridge, North Redma, Medininagar, Jharkhand 822101</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0" />
              <span>rohitkumar13.work@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} New Adhunik Electric. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer">Terms of Service</span>
            <span className="hover:text-primary cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
