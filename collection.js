const mountCollectionDetail = async function() {
  // collection 상세페이지
  if (window.document.location.pathname.includes('/collection-')) {
    const createElement = function() {
      const grid = document.querySelector('.grid-inner')
      grid.classList.add('relative-box');

      const mainImgContainer = document.createElement('div');
      mainImgContainer.classList.add('collection_main-container');
      
      const mainImg = document.createElement('img');
      const mainImgWrapper = document.createElement('div');
      mainImg.classList.add('collection_main-img');
      mainImgWrapper.classList.add('collection_main-img-wrapper')
      mainImgWrapper.classList.add('hidden');

      const leftArrowContainer = document.createElement('div'); // div 컨테이너로 변경
      const rightArrowContainer = document.createElement('div'); 
      leftArrowContainer.classList.add('collection_arrow-left');
      rightArrowContainer.classList.add('collection_arrow-right');

      const leftArrow = leftArrowContainer.childNodes[0];
      const rightArrow = rightArrowContainer.childNodes[0];

      return {
        grid,
        mainImgContainer,
        mainImg,
        mainImgWrapper,
        leftArrowContainer,
        rightArrowContainer,
        leftArrow,
        rightArrow
      }
    }

    let ARROW_COUNT = 0;

    const setSmallImgAsMainByArrow = function(smallImgNodeList, { type }) {
      if (type === 'left' && ARROW_COUNT > 0) ARROW_COUNT--;
      if (type === 'right' && ARROW_COUNT < smallImgNodeList.length - 1) ARROW_COUNT++;
      
      const smallImgDataSrc = smallImgNodeList[ARROW_COUNT].getAttribute('data-srcset');
      setSmallImgAsMainImg({ smallImgDataSrc });
        
      return; 
    }

    const makeDetailMainImg = function() {
      const { grid, mainImgContainer, mainImg, mainImgWrapper, leftArrowContainer, rightArrowContainer, leftArrow, rightArrow } = createElement();

      const layGrid = document.querySelector('#grid');
      layGrid.classList.add('detail_grid');

      const appendMainImgAndArrow = function() {
        mainImgWrapper.appendChild(mainImg);
        mainImgWrapper.appendChild(leftArrowContainer);
        mainImgWrapper.appendChild(rightArrowContainer);
        mainImgContainer.appendChild(mainImgWrapper);

        grid.appendChild(mainImgContainer)
      }

      const listenArrowClick = function () {
        const smallImgNodeList = document.querySelectorAll('.collection_small-img .img > img');

        leftArrowContainer.addEventListener('click', ()=> setSmallImgAsMainByArrow(smallImgNodeList, { type: 'left' }));
        rightArrowContainer.addEventListener('click', ()=> setSmallImgAsMainByArrow(smallImgNodeList, { type: 'right' }));
      }
  
      const collectionName = window.document.location.pathname;
      
      // TODO: collection_main-img detail 페이지 처음에 바인딩하는것 고정값 말고 smallImgDataSrc 에서 불러와서
      if (collectionName.includes('2021fw-studio')) {
        const collectionImgUrl = '21FW_lookbook_studio_018'
        mainImg.setAttribute('src', `./wp-content/uploads/${collectionImgUrl}.jpg`);
        appendMainImgAndArrow();
        listenArrowClick();
        return;
      }
      
      if (collectionName.includes('2021fw-concept')) {
        const collectionImgUrl = '21FW_lookbook_concept_001'
        mainImg.setAttribute('src', `./wp-content/uploads/${collectionImgUrl}.jpg`);
        appendMainImgAndArrow();
        listenArrowClick();
        return;
      }
    }

    const setMainImgVisible = function() {
      const mainImgWrapper = document.querySelector('.collection_main-img-wrapper')
      mainImgWrapper.classList.remove('hidden');
    }

    makeDetailMainImg();
    await setTimeout(setMainImgVisible, 300);
    
    const setSmallImgAsMainImg = function({ smallImgDataSrc }) {
      const mainImg = document.querySelector('.collection_main-img');
      const arr1 = smallImgDataSrc.split(',').map((el)=> el.split(' '));
      const arr2 = arr1.map((el)=> el[el.length-1]);

      const bigImgSize = arr2.map((el) => el.slice(0, -1)).sort((a, b) => b - a)[0];
      
      const endIndex = smallImgDataSrc.lastIndexOf( `${bigImgSize}w`);
    
      const startIndex = smallImgDataSrc.substring(0, endIndex).lastIndexOf(',');
      const src = smallImgDataSrc.substring(startIndex + 2, endIndex);

      mainImg.setAttribute('src', src);
      mainImg.setAttribute('data-srcset', smallImgDataSrc);
      mainImg.setAttribute('sizes', '685px');
    }

    const listenSmallImgToShowAsMain = function() {
      const smallImgNodeList = document.querySelectorAll('.collection_small-img .img > img');
      for (let i = 0; i < smallImgNodeList.length; i++) {
        const smallImgDataSrc = smallImgNodeList[i].getAttribute('data-srcset');
        smallImgNodeList[i].addEventListener(
          'click', ()=> setSmallImgAsMainImg({ smallImgDataSrc }), true
        );
      }
    }
    
    listenSmallImgToShowAsMain();
  }
  return null;
}


function addCustomRouterEvent() {
  history.pushState = ( f => function pushState(){
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  })(history.pushState);

  history.replaceState = ( f => function replaceState(){
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  })(history.replaceState);

  window.addEventListener('popstate',()=>{
    window.dispatchEvent(new Event('locationchange'))
  });

  window.addEventListener('locationchange', async function() {
    if (window.document.location.pathname.includes('/collection-')) {
      history.go(0);
      await setTimeout(mountCollectionDetail, 200)
    }
  })
}


window.addEventListener('load', () => addCustomRouterEvent());
window.addEventListener('load', ()=> setTimeout(mountCollectionDetail, 200));