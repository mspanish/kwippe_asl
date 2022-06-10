    <script>
    const saveFile = (data, filename) => {
      var save_link = document.createElement('a');
      save_link.href = data;
      save_link.download = filename;
    
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      save_link.dispatchEvent(event);
    };
    
    const uploadImg = () => {
      document.getElementById("imgInput").click();
    };
    
    const loadExpImg = () => {
      var imgElement = document.getElementById("expImg"); //声明我们的图片
      var imgInstance = new fabric.Image(imgElement, {
        selectable: false
        // zIndex:-99,
      });
      this.canvas.add(imgInstance);
    };
    
    const uploadImgChange = () => {
      var eleImportInput = document.getElementById("imgInput");
      this.imgFile = eleImportInput.files[0];
      var imgSrc = "",
        imgTitle = "";
      if (/\.(jpe?g|png|gif)$/i.test(this.imgFile.name)) {
        var reader = new FileReader();
        var _this = this;
        reader.addEventListener(
          "load",
          function() {
            imgTitle = _this.imgFile.name;
            _this.imgSrc = this.result;
          },
          false
        );
        reader.readAsDataURL(this.imgFile);
      }
      var imgElement = document.getElementById("img"); //声明我们的图片
      
      imgElement.onload = () => {
        this.width = imgElement.width
        this.height = imgElement.height
        var imgInstance = new fabric.Image(imgElement, {
          zIndex: -1,
          selectable: false
        });
        this.canvas.add(imgInstance);
      };
    };
    </script>
    <input type="file" on:change="{uploadImgChange}" id="imgInput" accept="image/*" />
    <img id="img" src="{imgSrc}" />
    <img id="expImg" src="images/exp.jpg" />
