# react-avatar-cropper

This is a fork of React Avatar Cropper by Justin
(https://github.com/DropsOfSerenity/react-avatar-cropper) using
semantic-ui-react components instead of bootstrap and working on mobile devices
too.

React Avatar Cropper aims to be an out of the box solution to solve the avatar cropping problem for 99% of common use cases. Most of the time you want a modal to pop up, allow the user to crop their uploaded image, and then you want to receive that base64 data to display and send to the server. React Avatar Cropper takes care of this use case.

Taking heavy inspiration from slack's and facebook's user photo cropper, react-avatar-cropper is here to make it easy.


## Demo

There is a demo on http://dropsofserenity.github.io/react-avatar-cropper/

## Installation

In your project

```shell
npm install --save https://github.com/yusupova/react-avatar-cropper
```
react-avatar-cropper also depends on react obviously :)

```shell
npm install --save react
```

It also needs semantic-ui-react for modal functionality.

```shell
npm install --save semantic-ui-react
```

Add semantic-ui styles for modal proper appearance.

1. You can include cdn link in your index.html file

  ```html
  <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.2/semantic.min.css"></link>
  ```

2. Or install semantic-ui-css package

  ```shell
  npm install semantic-ui-css --save
  ```
  and include it in your file

  ```js
  import 'semantic-ui-css/semantic.min.css';
  ```

## Usage

Usage is fairly simple, you can check the /example folder on github for a slightly more complex use case (the use case you see above in the demo). AvatarCropper simple takes a width and a height to determine what size avatar you would like. AvatarCropper then takes an image property where you can pass an external image, a user uploaded data URI or whatever you would like. An onRequestHide function is passed to the underlying modal so you can decide how to dismiss the modal. Lastly onCrop callback function is required, and gives you back the cropped Image, for you to do with as you wish.

```js
// require the component
var AvatarCropper = require("react-avatar-cropper");
// or es6:
import AvatarCropper from 'react-avatar-cropper'

// and in the render function of wherever you please...
// modalOptions are options for Modal component https://react.semantic-ui.com/modules/modal
render() {
  return (
    <AvatarCropper
      modalOptions={{dimmer: 'blurring', size: 'small'}}
      onRequestHide={this.handleRequestHide}
      onCrop={this.handleCrop}
      image={this.state.img}
      width={400}
      height={400}
      //return image with canvas size instead of original size
      isOriginalSize={false}
    />
  );
}
```

## Example

There is an example of this common use case on the page for this plugin.
Most importantly we pass the cropped DataURI back through your provided
onCrop function.

Check out http://dropsofserenity.github.io/react-avatar-cropper/ for more examples and info.

## Contributing

Feel free to place issues on the issue tracker or place a pull request
regarding any functionality. I would like to keep this package limited
to providing a great solution for the wide 99% use case that people have
for avatar croppers.

-----------------------

Thanks for looking! <3
