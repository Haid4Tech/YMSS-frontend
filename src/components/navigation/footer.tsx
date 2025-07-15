"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { navItem } from "@/common/data";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const [date] = useState<Date>(new Date());

  const departments = [
    "Main Office",
    "Guidance Counseling",
    "Athletics Department",
    "Nurse's Office",
    "Library Services",
    "Technology Support",
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-gradient-to-r from-purple-200 to-orange-100 p-2 rounded-lg">
                <Image
                  src={"/YMSS_logo-nobg.png"}
                  alt={"school logo"}
                  width={50}
                  height={50}
                />
              </div>
              <span className="font-bold text-xl">YMSS</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Empowering students to achieve academic excellence, develop
              character, and become responsible citizens prepared for success in
              college and beyond.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">
                  1234 Education Drive, Learning City, LC 12345
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-400" />
                <span className="text-gray-300">info@oakwoodhigh.edu</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="flex flex-col space-y-3">
              {navItem.map((item, index) => (
                <Link
                  href={item.url}
                  key={index}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Departments</h3>
            <ul className="space-y-3">
              {departments.map((dept, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {dept}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <Youtube className="h-6 w-6" />
              </a>
            </div>

            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>
                &copy; {dayjs(date).format("YYYY")} HAID Technologies. All
                rights reserved.
              </p>
              <p className="mt-1">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                {" • "}
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Use
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
