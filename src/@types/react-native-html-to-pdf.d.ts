declare module 'react-native-html-to-pdf' {
  interface Options {
    html: string;
    fileName: string;
    directory?: string;
    base64?: boolean;
    height?: number;
    width?: number;
    padding?: number;
    bgColor?: string;
  }

  interface PDFResult {
    filePath: string;
    base64?: string;
  }

  const convert: (options: Options) => Promise<PDFResult>;

  export default {
    convert,
  };
}
