import React from 'react';
import { Link } from 'react-router-dom';
import { Divider } from '@mui/material';

const sections = [
  { title: 'Quick Links', links: ['Home', 'About', 'Contact'] },
  { title: 'Customer Service', links: ['Help Center', 'Returns', 'Shipping Info'] },
  { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
];

function Footer() {
  return (
    <footer className="mt-12 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <h4 className="text-lg font-bold text-white">ShopCart</h4>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            A focused shopping experience for canteen essentials, electronics, groceries, and daily needs.
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-sm font-bold uppercase tracking-wide text-white">{section.title}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {section.links.map((link) => (
                <li key={link}>
                  <Link to={link === 'Home' ? '/' : '/#'} className="text-slate-400 transition hover:text-emerald-300">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Divider className="!border-slate-800" />
      <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">
        © 2026 ShopCart. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
