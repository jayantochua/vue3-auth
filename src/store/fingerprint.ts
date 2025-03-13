export class BrowserFingerprinter {
  private fingerprint: string | null = null;

  constructor() {
    this.generateDeterministicFingerprint();
  }

  /**
   * Menghasilkan fingerprint deterministik berdasarkan properti browser yang stabil
   */
  private generateDeterministicFingerprint(): void {
    const stableComponents = this.collectStableComponents();
    //  console.log("stableComponents", stableComponents);
    this.fingerprint = this.hashString(stableComponents.join("###"));
  }

  /**
   * Mengumpulkan komponen browser yang stabil untuk fingerprinting.
   * Komponen ini tidak dipengaruhi oleh development mode atau screen size.
   * @returns {string[]} Array dari komponen browser yang stabil
   */
  private collectStableComponents(): string[] {
    return [
      // Hardware dan sistem (properti yang relatif stabil)
      navigator.platform || "platform:unknown",
      String(navigator.hardwareConcurrency) || "hardwareConcurrency:unknown",

      // Kapabilitas browser yang tidak berubah sering
      "timezone:" + new Date().getTimezoneOffset(),
      "dnt:" + (navigator.doNotTrack || "unknown"),
      "lang:" + (navigator.language || "unknown"),
      "cookie:" + (navigator.cookieEnabled ? "1" : "0"),

      // WebGL Metadata (diabaikan jika tidak tersedia)
      "getWebGLMetadata:" + this.getWebGLMetadata(),

      // Canvas Fingerprint (diabaikan jika tidak didukung)
      "getCanvasFingerprint:" + this.getCanvasFingerprint(),
    ];
  }

  /**
   * Mendapatkan metadata WebGL yang stabil
   * @returns {string} String yang merepresentasikan informasi WebGL
   */
  private getWebGLMetadata(): string {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

      if (!gl) {
        return "webgl:not-supported";
      }

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

      if (!debugInfo) {
        return "webgl:info-not-available";
      }

      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "unknown";
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "unknown";

      // Gunakan hanya indikator dasar seperti nama vendor utama
      let vendorKey = "unknown";
      if (vendor.includes("Intel")) vendorKey = "intel";
      else if (vendor.includes("NVIDIA")) vendorKey = "nvidia";
      else if (vendor.includes("AMD") || vendor.includes("ATI")) vendorKey = "amd";
      else if (vendor.includes("Apple")) vendorKey = "apple";

      const isSoftwareRenderer = renderer.includes("SwiftShader") || renderer.includes("software") || renderer.includes("ANGLE");
      return `webgl:${vendorKey}:${isSoftwareRenderer ? "sw" : "hw"}`;
    } catch (e) {
      return "webgl:error";
    }
  }

  /**
   * Mendapatkan fingerprint dari canvas yang deterministik
   * @returns {string} Hash dari gambar canvas
   */
  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 50;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return "canvas:not-supported";
      }

      ctx.textBaseline = "top";
      ctx.font = "16px Arial";
      ctx.fillStyle = "#F60";
      ctx.fillRect(125, 10, 50, 30);
      ctx.fillStyle = "#069";
      ctx.fillText("CanvasTest", 4, 20);

      const canvasData = canvas.toDataURL("image/png").slice(0, 100);
      return this.hashString(canvasData);
    } catch (e) {
      return "canvas:not-supported";
    }
  }

  /**
   * Menghasilkan hash deterministik dari string
   * @param {string} str - String yang akan di-hash
   * @returns {string} Hash dalam bentuk hex
   */
  private hashString(str: string): string {
    let hash = 0x811c9dc5; // FNV offset basis 32-bit
    const prime = 0x01000193; // FNV prime 32-bit

    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * prime) >>> 0; // Memastikan tetap sebagai bilangan 32-bit unsigned
    }

    return hash.toString(16).padStart(8, "0");
  }

  /**
   * Mendapatkan fingerprint yang sudah dibuat
   * @returns {string} Fingerprint browser
   */
  public getFingerprint(): string {
    if (!this.fingerprint) {
      this.generateDeterministicFingerprint();
    }
    return this.fingerprint!;
  }

  /**
   * Memaksa pembuatan fingerprint ulang (jika diperlukan)
   * @returns {string} Fingerprint yang diperbarui
   */
  public refreshFingerprint(): string {
    this.generateDeterministicFingerprint();
    return this.fingerprint!;
  }
}

// Contoh penggunaan:
// const fingerprinter = new BrowserFingerprinter();
// console.log("BrowserID", fingerprinter.getFingerprint()); // Menampilkan fingerprint yang konsisten
