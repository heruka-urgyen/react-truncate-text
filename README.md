React-truncate-text
===================

> Truncate text in react component

## How to use
1. `npm install heruka-urgyen/react-truncate-text`
2. `import Truncate from "@heruka_urgyen/react-truncate-text"`
3. In your component:

```javascript
  <Truncate tailLength={tailLength} title={title} className={className}>
    text to be truncated
  </Truncate>
```

4. Props:
  + `children` _(string, required)_ - text to be truncated
  + `tailLength` _(integer, required)_ - length of tail that is not truncated (`tailLength` symbols from the right)
  + `title` _(string, optional)_ - tooltip text, defaults to `children`
  + `className` _(string, optional)_ - `className` to style `Truncate` container element

## Development / Testing / Example
[Live example](https://heruka-urgyen.github.io/react-truncate-text/)

1. Checkout this repository
2. `npm install`
3. `npm run test`
4. `npm run example`
5. Open browser on `localhost:9000`
6. Edit `example/index.js`, it will be live-reloaded

## License
MIT
