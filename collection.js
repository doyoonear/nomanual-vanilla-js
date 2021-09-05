const getSlugListByCategoryId = async function() {
  const data = await window.fetch('https://nomanual-official.com/wp-json/wp/v2/posts?categories=2', {
    method: 'GET', 
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res)=> res.json())

  const collectionDetailSlugs = data.filter((post)=> post.slug.includes('collection-')).map((post)=> post.slug)
  return collectionDetailSlugs;
}

const getPostListBySlug = async function(slugList) {
  console.log('getPostListBySlug start')

  let resultAA = [];

  const fetchPostList = async (slug) => {
    try {
      const [res] = await window.fetch(`https://nomanual-official.com/wp-json/wp/v2/posts?slug=${slug}`, {
      method: 'GET', 
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res)=> res.json());
     
      resultAA = [...resultAA, res];

      return resultAA; 
    }
    catch(err) {
      console.error(err)
    }
  }

  let forResult = [];

  for(let i in slugList) {
    const b = await fetchPostList(slugList[i]); 
    const c = b.map((el)=> el.featuredMedia);
    forResult = [...forResult, c];
  }

  return resultAA;
}

const getMediaSrc = async function(mediaIdList) {
  const fetchMediaSrcById = function(mediaId) {
    return window.fetch(`https://nomanual-official.com/wp-json/wp/v2/media/${mediaId}`, {
      method: 'GET', 
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res)=> res.json())
  }

  const callbackAgain = async function(id) {
    const data = await fetchMediaSrcById(id);
    const src = data.source_url;
    return src;
  }
  
  let srcList = [];

  for(let i in mediaIdList) {
    const src = await callbackAgain(mediaIdList[i])
    srcList = [...srcList, src];
  }
  
  return srcList;
}

async function letsGo() {
  try {
    const slugList = await getSlugListByCategoryId(); // ['collection-2021fw-concept', 'collection-2021fw-studio'] - categoryId 2 ('collection') 에 걸리는 slugList
    const postList = await getPostListBySlug(slugList); // 아래 postList 참고 - 해당 slugList 로 필터된 찾은 실제 postList
    const mediaIdList = postList.map((post)=> post.featured_media); // [457, 417]
    const srcList = await getMediaSrc(mediaIdList); // 이제 맞는 slug 인 곳에 route 로 이동했을때 거기것을 가져다가 쓰기. 
    return {
      slugList,
      postList,
      mediaIdList,
      srcList,
    }
  } catch(err) {
    console.error(err);
  }
}

/*
  postList: [{}, {}, {}],
  post: {
    author: 1
    categories: [2]
    content: {rendered: '', protected: false}
    featured_media: 457
    id: 439
    link: "https://nomanual-official.com/collection-2021fw-studio/"
    meta: []
    slug: "collection-2021fw-studio"
    status: "publish"
    sticky: false
    tags: [10]
    template: ""
    title: {rendered: '2021FW STUDIO'}
    type: "post"
  }
*/

const mountCollectionDetail = async function() {
 
    
  // collection 상세페이지
  // if (window.document.location.pathname.includes('/collection-')) {
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

    const makeDetailMainImg = async function() {
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

      const useSlugForMainImgSrc = async function() {
        const {  
          slugList,
          postList,
          mediaIdList,
          srcList } = await letsGo();

          const collectionName = window.document.location.pathname;

        for(let i in slugList) {
          console.log('slugList[i]', slugList[i]);
          if (collectionName.includes(slugList[i])) {
            console.log(' srcList[i]',  srcList[i]);
            const collectionImgUrl = srcList[i];
            mainImg.setAttribute('src', `./wp-content/uploads/${collectionImgUrl}.jpg`);
            appendMainImgAndArrow();
            listenArrowClick();
            return;
          }
        }
      }

      useSlugForMainImgSrc();
    }

    const setMainImgVisible = function() {
      const mainImgWrapper = document.querySelector('.collection_main-img-wrapper')
      mainImgWrapper.classList.remove('hidden');
    }

    await makeDetailMainImg();
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
  // }
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