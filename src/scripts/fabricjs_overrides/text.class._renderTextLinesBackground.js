  _renderTextLinesBackground: function(ctx) {
      if (!this.textBackgroundColor && !this.styleHas('textBackgroundColor')) {
        return;
      }
      
      ctx.fillStyle = this.textBackgroundColor;
      this.rx = this.rx || 10;
      this.ry = this.ry || 10;
      let topOffset = this._getTopOffset()
      //console.log('_renderTextLinesBackground...')

      let rx = this.rx ? Math.min(this.rx, this.width / 2) : 0,
        ry = this.ry ? Math.min(this.ry, this.height / 2) : 0,
        w = this.width  * this.xPadding,
        h = (this.height * this.yPadding) + (topOffset),
        x = -w / 2,
        y = -h / 2,
        isRounded = rx !== 0 || ry !== 0,
        k = 1 - 0.5522847498;
        
      ctx.beginPath();

      ctx.moveTo(x + rx, y);

      ctx.lineTo(x + w - rx, y);
      isRounded && ctx.bezierCurveTo(x + w - k * rx, y, x + w, y + k * ry, x + w, y + ry);

      ctx.lineTo(x + w, y + h - ry);
      isRounded && ctx.bezierCurveTo(x + w, y + h - k * ry, x + w - k * rx, y + h, x + w - rx, y + h);

      ctx.lineTo(x + rx, y + h);
      isRounded && ctx.bezierCurveTo(x + k * rx, y + h, x, y + h - k * ry, x, y + h - ry);

      ctx.lineTo(x, y + ry);
      isRounded && ctx.bezierCurveTo(x, y + k * ry, x + k * rx, y, x + rx, y);

      ctx.closePath();

      this._renderPaintInOrder(ctx);
      this._removeShadow(ctx);
    },
