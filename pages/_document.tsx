import { Html, Head, Main, NextScript } from "next/document";
import Image from "next/image";
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        <footer className="footer">
          <img
            src="/YOTR-footer-KB-logo.png"
            alt="YOTR Footer Logo"
            className="footer-logo"
          />
          <div className="footer-social-icons">
            <a href="https://twitter.com/knucklebunnyds" target="_blank" rel="noopener noreferrer">
              <img src="/icon-twitter.png" alt="Twitter Icon" />
            </a>
            <a href="https://discord.gg/kbds" target="_blank" rel="noopener noreferrer">
              <img src="/icon-discord.png" alt="Discord Icon" />
            </a>
            <a href="https://www.instagram.com/knucklebunnydeathsquad/" target="_blank" rel="noopener noreferrer">
              <img src="/icon-insta.png" alt="Instagram Icon" />
            </a>
            <a href="https://knucklebunnydeathsquad.com/" target="_blank" rel="noopener noreferrer">
              <img src="/icon-web.png" alt="Web Icon" />
            </a>
          </div>
          <p className="footer-text">© 2023 Knuckle Bunny Studios</p>
        </footer>
      </body>
    </Html>
  );
}

