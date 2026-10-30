import type { Metadata } from 'next';
import { SiteDocument } from '@/components/site-document';
// Next injects noindex for this 404; do not emit a duplicate robots meta.
export const metadata: Metadata = { title: 'Page not found — AWSM' };
export default function GlobalNotFound() {
  return <SiteDocument locale="en"><main className="section wrap not-found"><p>404 / AWSM</p><h1>That connection is missing.</h1><p>This page does not exist. Halaman ini tidak ditemukan.</p><nav><a className="button button-dark" href="/">English home</a><a className="button button-outline" href="/id">Beranda Indonesia</a></nav></main></SiteDocument>;
}
