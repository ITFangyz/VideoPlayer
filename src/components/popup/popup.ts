
// import "./popup.css"    //全局css操作
let styles = require('./popup.css')
// import styles from './popup.css'    //import的引入方式
console.log(styles)

//配置接口
interface Ipopup {
    width? : string;
    height? : string;
    title? : string;
    pos? : string;
    mask? : boolean;
    content? : (content : HTMLElement) => void
}

//设置组件规范
interface Icomponent {
    templateContainer: HTMLElement
    init: () => void
    template: () => void
    handle: () => void
}

function popup ( options : Ipopup) {
    return new Popup(options)
}


//通过 implements 约束类
class Popup implements Icomponent{
    templateContainer;
    mask;
    //使用修饰符
    constructor ( private settings : Ipopup){
        this.settings = Object.assign({
            width: '100%',  //默认值
            height: '100%',
            title: '',
            pos: 'center',
            mask: true,
            content: function(){}
        }, this.settings)
        this.init()
    }

    //初始化
    init(){
        this.template()
        this.settings.mask && this.createMask()     //判断mask为true再创建
        this.handle()
        this.contentCallBack()
    }

    //模板
    template(){
        this.templateContainer = document.createElement('div')
        this.templateContainer.style.width = this.settings.width
        this.templateContainer.style.height = this.settings.height
        this.templateContainer.className = styles.default.popup
        this.templateContainer.innerHTML = `
            <div class="${styles.default['popup-title']}">
                <h3>${ this.settings.title }</h3>
                <i class="iconfont icon-guanbi"></i>
            </div>
            <div class="${styles.default['popup-content']}">
            </div>
        `
        document.body.appendChild(this.templateContainer)

        if (this.settings.pos === 'left') {
            this.templateContainer.style.left = 0;
            this.templateContainer.style.top = (window.innerHeight - this.templateContainer.offsetHeight) + 'px'
        }
        else if (this.settings.pos === 'right') {
            this.templateContainer.style.right = 0;
            this.templateContainer.style.top = (window.innerHeight - this.templateContainer.offsetHeight) + 'px'
        }
        else {
            this.templateContainer.style.left = (window.innerWidth - this.templateContainer.offsetWidth)/2 + 'px'
            this.templateContainer.style.top = (window.innerHeight - this.templateContainer.offsetHeight)/2 + 'px'
        }
    }

    //事件操作
    handle(){
        let popupClose = this.templateContainer.querySelector(`.${styles.default['popup-title']} i`)
        popupClose.addEventListener('click', () => {
            document.body.removeChild(this.templateContainer)
            this.settings.mask && document.body.removeChild(this.mask)
        })
    }
    // 创建遮罩层
    createMask(){
        this.mask = document.createElement('div')
        this.mask.className = styles.default.mask;
        this.mask.style.width = '100%';
        this.mask.style.height = document.body.offsetHeight + 'px'
        document.body.appendChild(this.mask)
    }
    //回调函数
    contentCallBack(){
        let popupContent = this.templateContainer.querySelector(`.${styles.default['popup-content']}`);
        this.settings.content(popupContent)
    }
}

export default popup;