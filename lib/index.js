import "./styles.css";
import React from "react";
import {isDataURL} from "./utils";
import warning from "react/lib/warning";

var numberableType = (props, propName, componentName) => {
  warning(
    !isNaN(parseInt(props[propName])),
    `Invalid ${propName} '${props.size}' sent to '${componentName}'. Requires an
    int or string capable of conversion to an int.
    Check the render method of == '${componentName}'. == `
  );
};

class Cropper extends React.Component {

  constructor () {
    super();

    // getInitialState
    this.state = {
      dragging: false,
      image: {},
      mouse: {
        x: null,
        y: null
      },
      preview: null
    };

    this.listeners = [];

  }

  fitImageToCanvas (width, height) {
    var scaledHeight, scaledWidth;

    var canvasAspectRatio = this.props.height / this.props.width;
    var imageAspectRatio = height / width;

    if (canvasAspectRatio > imageAspectRatio) {
      scaledHeight = this.props.height;
      var scaleRatio = scaledHeight / height;
      scaledWidth = width * scaleRatio;
    } else {
      scaledWidth = this.props.width;
      var scaleRatio = scaledWidth / width;
      scaledHeight = height * scaleRatio;
    }

    return { width: scaledWidth, height: scaledHeight };
  }

  prepareImage (imageUri) {
    var img = new Image();
    if (!isDataURL(imageUri)) img.crossOrigin = 'anonymous';
    img.onload = () => {
      var scaledImage = this.fitImageToCanvas(img.width, img.height);
      scaledImage.resource = img;
      scaledImage.x = 0;
      scaledImage.y = 0;
      this.setState({dragging: false, image: scaledImage, preview: this.toDataURL()});
    }
    img.src = imageUri;
  }

  mouseDownListener (e) {
    this.setState({
      image: this.state.image,
      dragging: true,
      mouse: {
        x: null,
        y: null
      }
    });
  }

  preventSelection (e) {
    if (this.state.dragging) {
      e.preventDefault();
      return false;
    }
  }

  mouseUpListener (e) {
    this.setState({ dragging: false, preview: this.toDataURL() });
  }

  mouseMoveListener (e) {
    if (!this.state.dragging) return;

    var mouseX = e.clientX;
    var mouseY = e.clientY;
    var imageX = this.state.image.x;
    var imageY = this.state.image.y;

    var newImage = this.state.image;

    if (this.state.mouse.x && this.state.mouse.y) {
      var dx = this.state.mouse.x - mouseX;
      var dy = this.state.mouse.y - mouseY;

      var bounded = this.boundedCoords(imageX, imageY, dx, dy);

      newImage.x = bounded.x;
      newImage.y = bounded.y;
    }

    this.setState({
      image: this.state.image,
      mouse: {
        x: mouseX,
        y: mouseY
      }
    });
  }

  boundedCoords (x, y, dx, dy) {
    var newX = x - dx;
    var newY = y - dy;

    var scaledWidth = this.state.image.width * this.props.zoom;
    var dw = (scaledWidth - this.state.image.width) / 2;
    var imageLeftEdge = this.state.image.x - dw;
    var imageRightEdge = (imageLeftEdge + scaledWidth);

    var rightEdge = this.props.width;
    var leftEdge = 0;

    if (newX - dw > 0) { x = dw; }
    else if (newX < (-scaledWidth + rightEdge)) { x = rightEdge - scaledWidth; }
    else {
      x = newX;
    }

    var scaledHeight = this.state.image.height * this.props.zoom;
    var dh = (scaledHeight - this.state.image.height) / 2;
    var imageTopEdge = this.state.image.y - dh;
    var imageBottomEdge = imageTopEdge + scaledHeight;

    var bottomEdge = this.props.height
    var topEdge = 0;
    if (newY - dw > 0) { y = dh; }
    else if (newY < (-scaledHeight + bottomEdge)) { y = bottomEdge - scaledHeight; }
    else {
      y = newY;
    }

    return { x: x, y: y };
  }

  componentDidMount () {
    var canvas = React.findDOMNode(this.refs.canvas);
    var context = canvas.getContext("2d");
    this.prepareImage(this.props.image);

    this.listeners = {
      mousemove: e => this.mouseMoveListener(e),
      mouseup: e => this.mouseUpListener(e),
      mousedown: e => this.mouseDownListener(e)
    };

    window.addEventListener("mousemove", this.listeners.mousemove, false);
    window.addEventListener("mouseup", this.listeners.mouseup, false);
    canvas.addEventListener("mousedown", this.listeners.mousedown, false);
    document.onselectstart = e => this.preventSelection(e);
  }

  // make sure we clean up listeners when unmounted.
  componentWillUnmount () {
    var canvas = React.findDOMNode(this.refs.canvas);
    window.removeEventListener("mousemove", this.listeners.mousemove);
    window.removeEventListener("mouseup", this.listeners.mouseup);
    canvas.removeEventListener("mousedown", this.listeners.mousedown);
  }

  componentDidUpdate () {
    var context = React.findDOMNode(this.refs.canvas).getContext("2d");
    context.clearRect(0, 0, this.props.width, this.props.height);
    this.addImageToCanvas(context, this.state.image);
  }

  addImageToCanvas (context, image) {
    if (!image.resource) return;
    context.save();
    context.globalCompositeOperation = "destination-over";
    var scaledWidth = this.state.image.width * this.props.zoom;
    var scaledHeight = this.state.image.height * this.props.zoom;

    var x = image.x - (scaledWidth - this.state.image.width) / 2;
    var y = image.y - (scaledHeight - this.state.image.height) / 2;

    // need to make sure we aren't going out of bounds here...
    x = Math.min(x, 0);
    y = Math.min(y, 0);
    y = scaledHeight + y >= this.props.height ? y : (y + (this.props.height - (scaledHeight + y)));
    x = scaledWidth + x >= this.props.width ? x : (x + (this.props.width - (scaledWidth + x)));

    context.drawImage( image.resource, x, y, image.width * this.props.zoom, image.height * this.props.zoom);
    context.restore();
  }

  toDataURL () {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = this.props.width;
    canvas.height = this.props.height;

    this.addImageToCanvas(context, {
      resource: this.state.image.resource,
      x: this.state.image.x,
      y: this.state.image.y,
      height: this.state.image.height,
      width: this.state.image.width
    });

    return canvas.toDataURL();
  }

  handleCrop () {
    var data = this.toDataURL();
    this.props.onCrop(data);
  }

  render () {
    return (
      <div>

        <canvas
          ref="canvas"
          width={this.props.width}
          height={this.props.height}>
        </canvas>

        {this.state.preview &&
          <div>
            <img height={50} width={50} src={this.state.preview} />
          </div>
        }

        <button onClick={this.handleCrop.bind(this)}>Crop</button>

      </div>
    );
  }
};
Cropper.propTypes = {
    image: React.PropTypes.string.isRequired,
    width: numberableType,
    height: numberableType,
    zoom: numberableType
};
Cropper.defaultProps = { width: 400, height: 400, zoom: 1 };

class AvatarCropper extends React.Component {
  constructor () {
    super();
    this.state = {
      zoom: 1
    };
  }

  handleZoomUpdate () {
    var zoom = React.findDOMNode(this.refs.zoom).value;
    this.setState({ zoom: zoom });
  }

  render () {
    return (
      <div className="AvatarCropper-base">
        <Cropper
          image={this.props.image}
          width={this.props.width}
          height={this.props.height}
          onCrop={this.props.onCrop}
          zoom={this.state.zoom}
        />

        <input
          type="range"
          name="zoom"
          ref="zoom"
          onChange={this.handleZoomUpdate.bind(this)}
          min="1"
          max="3"
          step="0.01"
          defaultValue="1"
        />
      </div>
    );
  }
}

// The AvatarCropper Prop API
AvatarCropper.propTypes = {
  image: React.PropTypes.string.isRequired,
  onCrop: React.PropTypes.func.isRequired,
  width: numberableType,
  height: numberableType
};
AvatarCropper.defaultProps = { width: 400, height: 400 };

export default AvatarCropper;