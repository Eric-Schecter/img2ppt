export class Video {
  private video = document.createElement('video');
  private sourceCanvas = document.createElement('canvas');
  private sourceCtx = this.sourceCanvas.getContext('2d');
  private targetCanvas = document.createElement('canvas');
  private targetCtx = this.targetCanvas.getContext('2d');
  private width = 1;
  private height = 1;
  private frames: { frame: number, data: Uint8ClampedArray }[] = [];
  private imageData: string[] = [];
  private isLoading = false;
  private step = 10;
  private diffValue = 10;
  private size = 8;
  constructor() {
    this.video.muted = true;
    this.targetCanvas.width = this.size;
    this.targetCanvas.height = this.size;
  }
  public generate = (src: string): Promise<string[]> => {
    if (this.isLoading) {
      return new Promise((resolve, reject) => reject('isLoading'))
    }
    return new Promise(resolve => {
      this.video.src = src;
      this.isLoading = true;
      this.video.currentTime = 0;
      this.video.play();
      this.video.onloadeddata = () => {
        this.width = this.video.videoWidth;
        this.height = this.video.videoHeight;
        this.sourceCanvas.width = this.width;
        this.sourceCanvas.height = this.height;
        this.video.addEventListener('canplay', () => this.capture(resolve));
      }
    })
  }
  private isSame = (arr1: Uint8ClampedArray, arr2: Uint8ClampedArray) => {
    const length = arr1.length;
    for (let i = 0; i < length; i++) {
      if (~~(arr1[i] - arr2[i]) > this.diffValue) {
        return false;
      }
    }
    return true;
  }
  private capture = (resolve: (value: string[]) => void) => {
    if (!this.sourceCtx || !this.targetCtx) {
      return;
    }
    this.sourceCtx.drawImage(this.video, 0, 0, this.width, this.height);
    const videoData = this.data;
    if (videoData) {
      this.targetCtx.putImageData(videoData, 0, 0);
      this.targetCtx.drawImage(this.sourceCanvas, 0, 0, this.width, this.height, 0, 0, this.size, this.size);
      const { data } = this.targetCtx.getImageData(0, 0, this.size, this.size);
      if (!this.frames.length || !this.isSame(this.frames[this.frames.length - 1].data, data)) {
        this.frames.push({ frame: this.video.currentTime, data });
        this.imageData.push(this.sourceCanvas.toDataURL('image/png'));
      }
    }
    if (this.video.currentTime < this.video.duration) {
      this.video.currentTime += this.step;
    } else {
      this.isLoading = false;
      this.video.pause();
      resolve(this.imageData.slice());
      this.imageData = [];
      this.frames = [];
    }
  }
  private get data() {
    return this.sourceCtx?.getImageData(0, 0, this.width, this.height);
  }
  public get progress() {
    if (!this.video.duration) {
      return 0;
    }
    return (~~(this.video.currentTime / this.video.duration * 10000)) / 100;
  }
}