import './globals.css';
export const metadata = { title: 'Recapo | Client reports in minutes', description: 'Upload your ad export. Get a client-ready monthly report, written for you.' };
export default function RootLayout({ children }) {
  return (
    <html lang="en"><body>
      <header className="nav"><a href="/" className="logo">Recapo</a>
        <nav><a href="/pricing">Pricing</a><a href="/dashboard">Dashboard</a><a href="/login">Log in</a></nav></header>
      {children}
      <footer>© Recapo</footer>
    </body></html>
  );
    }
