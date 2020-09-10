const path = require("path");
const webpack = require("webpack");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const OfflinePlugin = require("offline-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");

let config = {
  entry: {
    main: ["./src/index"]
  },
  resolve: {
    modules: ["src", "files", "node_modules"]
  },
  devServer: {
    contentBase: path.join(__dirname, "docs"),
    inline: true,
    compress: true,
    host: '0.0.0.0',
    port: 8080
  },  
  output: {
    path: path.join(__dirname, "docs"),
    // publicPath: path.join(__dirname, "public/"),
    filename: "[name]-[chunkhash].js"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || ""),
        SITE_URL: JSON.stringify(process.env.SITE_URL || ""),
        DEFAULT_CREDITS: JSON.stringify(process.env.DEFAULT_CREDITS || ""),
        GOOGLE_ANALYTICS: JSON.stringify(process.env.GOOGLE_ANALYTICS || ""),
        LAUNCH_DATE: JSON.stringify(process.env.LAUNCH_DATE || ""),
      },
      __REACT_DEVTOOLS_GLOBAL_HOOK__: ({ isDisabled: true })
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: ["env", "react"],
          plugins: [
            "transform-object-rest-spread",
            "syntax-class-properties",
            "transform-class-properties"
          ]
        }
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.(png|jpg|gif|svg|woff2|woff|eot|ttf|mp4|pdf)$/,
        loader: "file-loader",
        options: {
          name(file) {
            if (file.indexOf("/documents/") !== -1) {
              return "[name]-[hash].[ext]";
            } else {
              return "[hash].[ext]";
            }
          }
        }
      },
      {
        test: /\.(md|txt)$/,
        use: [
          {
            loader: "raw-loader"
          }
        ]
      }
    ]
  }
};

const favicons = new FaviconsWebpackPlugin({
  logo: path.resolve("src/images", "logo.png")
});

const pwa = new WebpackPwaManifest({
  name: "Uru-Eu-Wau-Wau: Terra em Disputa",
  short_name: "Uru-Eu-Wau-Wau: Terra em Disputa",
  description:
    "A terra indígena vive constante ataque de invasores. Com a chegada do governo Bolsonaro, os interesses para a redução do território ficaram evidentes.",
  background_color: "#fff",
  orientation: "portrait",
  start_url: "/?launcher=true",
  icons: [
    {
      src: path.resolve("src/images", "logo.png"),
      sizes: [48, 96, 192, 256, 512]
    }
  ]
});

const html = new HTMLWebpackPlugin({
  template: path.resolve("src", "index.html"),
  filename: "index.html",
  inject: "body"
});

const html404 = new HTMLWebpackPlugin({
  template: path.resolve("src", "index.html"),
  filename: "404.html",
  inject: "body"
});

const offline = new OfflinePlugin({
  ServiceWorker: {
    events: true
  },
  caches: {
    main: [
      "index.html",
      "*.js",
      "*.css",
      "*.svg",
      "*.ttf",
      "*.woff",
      "*.woff2"
    ],
    additional: [":externals:", "*.jpg", "*.png"],
    optional: ":rest:"
  },
  cacheMaps: [
    {
      match: url => {
        const extension = url.pathname.split(".").pop();
        // Different origin
        if (url.origin !== location.origin) return;
        // PDF files
        if (extension == "pdf") return;
        return new URL("/", location);
      },
      requestTypes: ["navigate", "same-origin"]
    }
  ]
});

if (process.env.NODE_ENV == "production") {
  config.plugins = config.plugins.concat([favicons, pwa, html, offline]);
} else {
  config.plugins = config.plugins.concat([html, html404]);
}

module.exports = config;
