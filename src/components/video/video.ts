
let styles = require('./video.css')

interface IVideo {
    url : String,
    elem : string | HTMLElement,
    width? : string,
    height? : string,
    autoPlay? : boolean;
}



function video(options : IVideo){
    return new Video(options)
}


//设置组件规范
interface Icomponent {
    templateContainer: HTMLElement
    init: () => void
    template: () => void
    handle: () => void
}

class Video implements Icomponent{
    templateContainer: HTMLElement;
    constructor(private settings : IVideo){
        this.settings = Object.assign({
            width : '100%',
            height : '100%',
            autoplay : false
        }, this.settings)
        this.init()
    }

    init(){
        this.template()
        this.handle()
    }

    template(){
        this.templateContainer = document.createElement('div');
        this.templateContainer.className = styles.default.video;
        this.templateContainer.style.width = this.settings.width
        this.templateContainer.style.height = this.settings.height
        this.templateContainer.innerHTML = `
            <div class="videoParent">
                <video class="${styles.default['video-content']}" src="${this.settings.url}"></video>
            </div>
            
            <div class="${styles.default['video-controls']}">
                <div class="${styles.default['video-progress']}">
                    <div class="${styles.default['video-progress-now']}"></div>
                    <div class="${styles.default['video-progress-suc']}"></div>
                    <div class="${styles.default['video-progress-bar']}"></div>
                </div>
                <div class="${styles.default['video-play']}">
                    <i class="iconfont icon-bofang"></i>
                </div>
                <div class="${styles.default['video-time']}">
                    <span>00:00</span> /  <span>00:00</span>
                </div>
                <div class="${styles.default['video-full']}">
                    <i class="iconfont icon-quanping"></i>
                </div>
                <div class="${styles.default['video-volume']}">
                    <i class="iconfont icon-yinliang"></i>
                    <div class="${styles.default['video-volprogress']}">
                        <div class="${styles.default['video-volprogress-now']}"></div>
                        <div class="${styles.default['video-volprogress-bar']}"></div>
                    </div>
                </div>
            </div>
        `;
        // 对传入的elem做判断
        if (typeof this.settings.elem === 'object'){
            this.settings.elem.appendChild(this.templateContainer)
        }
        else{
            document.querySelector(`${this.settings.elem}`).appendChild(this.templateContainer)
        }
        
    }
    handle(){
        console.log('styles', styles)
        //在ts中将videoContent当作HTMLVideoElement元素，否则默认为html元素
        let videoContent : HTMLVideoElement= this.templateContainer.querySelector(`.${'videoParent'} video`)
        // let videoContent = this.templateContainer.querySelector(`.${'videoParent'} video`) as HTMLVideoElement
        let videoControl = this.templateContainer.querySelector(`.${styles.default['video-controls']}`)
        let videoPlay = this.templateContainer.querySelector(`.${styles.default['video-controls']} i`)
        let videoTimes = this.templateContainer.querySelectorAll(`.${styles.default['video-time']} span`)
        // 此处需要将获取的类型进行转换
        let videoProgress = this.templateContainer.querySelectorAll(`.${styles.default['video-progress']} div`) as NodeListOf<HTMLElement>
        let videoVolProgress = this.templateContainer.querySelectorAll(`.${styles.default['video-volprogress']} div`) as NodeListOf<HTMLElement>
        let videoFull = this.templateContainer.querySelector(`.${styles.default['video-full']} i`)
        let timer;
        // 音量的取值范围为0-1
        videoContent.volume = 0.5

        //设置打开时自动播放
        if(this.settings.autoPlay){
            timer = setInterval(playing, 1000)
            videoContent.play()
        }

        //设置鼠标划入视频窗口展示操作栏 移走隐藏
        this.templateContainer.addEventListener('mouseenter', function(){
            (videoControl as HTMLElement).style.bottom = '0'
        })
        this.templateContainer.addEventListener('mouseleave', function(){
            (videoControl as HTMLElement).style.bottom = '-50px'
        })
        
        
        console.log(videoProgress)
        //视频是否加载完毕
        videoContent.addEventListener('canplay', () => {
            console.log('canplay')
            videoTimes[1].innerHTML = formatTime(videoContent.duration);
        })

        //视频播放事件
        videoContent.addEventListener('play', () => {
            console.log('播放中')
            videoPlay.className = 'iconfont icon-24gf-pause2'
            timer = setInterval(playing, 1000)
        })

        //视频暂停事件
        videoContent.addEventListener('pause', () => {
            console.log('暂停')
            videoPlay.className = 'iconfont icon-bofang'
            clearInterval(timer)
        })

        //调用video标签的自带方法
        videoPlay.addEventListener('click', () => {
            if(videoContent.paused){
                videoContent.play()
            }
            else{
                videoContent.pause()
            }
        })

        //拖拽小球实现进度控制
        videoProgress[2].addEventListener('mousedown', function(ev: MouseEvent){
            let downX = ev.pageX
            let downL = this.offsetLeft
            document.onmousemove =  (ev: MouseEvent) => {
                let scale = (ev.pageX - downX + downL + 8) / (this.parentNode as HTMLElement).offsetWidth;
                if(scale<0){
                    scale = 0
                }
                else if (scale > 1){
                    scale = 1
                }
                videoProgress[0].style.width = scale * 100 + '%';
                videoProgress[1].style.width = scale * 100 + '%';
                this.style.left = scale * 100 + '%'; 
                videoContent.currentTime = scale * videoContent.duration;
            };
            document.onmouseup = () => {
                document.onmousemove = document.onmouseup = null;
            };
            //阻止默认事件行为，防止一些bug
            ev.preventDefault();
        })
        //拖拽小球实现音量控制
        videoVolProgress[1].addEventListener('mousedown', function(ev: MouseEvent){
            let downX = ev.pageX
            let downL = this.offsetLeft
            document.onmousemove =  (ev: MouseEvent) => {
                let scale = (ev.pageX - downX + downL + 8) / (this.parentNode as HTMLElement).offsetWidth;
                if(scale<0){
                    scale = 0
                }
                else if (scale > 1){
                    scale = 1
                }
                videoVolProgress[0].style.width = scale * 100 + '%';
                this.style.left = scale * 100 + '%'; 
                videoContent.volume = scale;
            };
            document.onmouseup = () => {
                document.onmousemove = document.onmouseup = null;
            };
            //阻止默认事件行为，防止一些bug
            ev.preventDefault();
        })

        //播放进度  实时展示当前播放进度
        function playing(){
            // 设置一个比例值获取当前播放进度占总体的比例
            let scale = videoContent.currentTime / videoContent.duration
            let scaleSuc = videoContent.buffered.end(0) / videoContent.duration
            videoProgress[0].style.width = scale*100 + '%'
            videoProgress[1].style.width = scaleSuc*100 + '%'
            videoProgress[2].style.left = scale*100 + '%'

            videoTimes[0].innerHTML = formatTime(videoContent.currentTime)
        }
        
        //事件格式转换
        function formatTime(number) :string{
            number = Math.round(number);
            // number = Math.round(number)
            let min = Math.floor(number/60);
            let sec = number%60
            return setZero(min) + ':' + setZero(sec)
        }
        //个位数补0
        function setZero(number:number):string{
            if(number < 10){
                return '0' + number
            }
            else {
                return ''+ number
            }
        }

        //全屏
        videoFull.addEventListener('click', () => {
            videoContent.requestFullscreen()
        })
    }
}

export default video