import "./globals.css";

import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
          <main >{children}</main>
        <Footer />
      </body>
    </html>
  );
}
