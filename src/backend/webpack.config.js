
module.exports = {
  entry: "./src/app.ts",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: { }
          }
        ]
      },
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: "bundle.js" 
  },
  devServer: {
    inline:true,
    port: 8008
  },
};
