/*
  API spec
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

/* 
API functions

*/
const fetchSlugListByCategoryId = async function () {
  const data = await window
    .fetch('https://nomanual-official.com/wp-json/wp/v2/posts?categories=2', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((res) => res.json());

  const collectionDetailSlugs = data.filter((post) => post.slug.includes('collection-')).map((post) => post.slug);
  return collectionDetailSlugs;
};

const getPostListBySlug = async function (slugList) {
  let result = [];

  const fetchPostList = async (slug) => {
    try {
      const [res] = await window
        .fetch(`https://nomanual-official.com/wp-json/wp/v2/posts?slug=${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((res) => res.json());

      result = [...result, res];
      return result;
    } catch (err) {
      console.error(err);
    }
  };

  let forResult = [];

  for (let i in slugList) {
    const b = await fetchPostList(slugList[i]);
    const c = b.map((el) => el.featuredMedia);
    forResult = [...forResult, c];
  }

  return result;
};

const getMediaSrc = async function (mediaIdList) {
  const fetchMediaSrcById = function (mediaId) {
    return window
      .fetch(`https://nomanual-official.com/wp-json/wp/v2/media/${mediaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((res) => res.json());
  };

  const callback = async function (id) {
    const data = await fetchMediaSrcById(id);
    const src = data.source_url;
    return src;
  };

  let srcList = [];

  for (let i in mediaIdList) {
    const src = await callback(mediaIdList[i]);
    srcList = [...srcList, src];
  }

  return srcList;
};

async function letsGo() {
  try {
    const slugList = await fetchSlugListByCategoryId(); // ['collection-2021fw-concept', 'collection-2021fw-studio'] - categoryId 2 ('collection') 에 걸리는 slugList
    const postList = await getPostListBySlug(slugList); // postList 참고 - 해당 slugList 로 필터된 찾은 실제 postList
    const mediaIdList = postList.map((post) => post.featured_media); // [457, 417]
    const srcList = await getMediaSrc(mediaIdList); // 이제 맞는 slug 인 곳에 route 로 이동했을때 거기것을 가져다가 쓰기.
    return {
      slugList,
      postList,
      mediaIdList,
      srcList,
    };
  } catch (err) {
    console.error(err);
  }
}

/* 
  DOM functions

*/

/* 
  2. createCollectionElements --------------
    Create Elements, Add class.
*/

const createCollectionElements = function () {
  const grid = document.querySelector('.grid-inner');
  grid.classList.add('relative-box');

  const mainImgContainer = document.createElement('div');
  mainImgContainer.classList.add('collection_main-container');

  const mainImg = document.createElement('img');
  const mainImgWrapper = document.createElement('div');
  mainImg.classList.add('collection_main-img');
  mainImgWrapper.classList.add('collection_main-img-wrapper');
  mainImgWrapper.classList.add('hidden');

  const leftArrowContainer = document.createElement('div'); // div 컨테이너로 변경
  const rightArrowContainer = document.createElement('div');
  leftArrowContainer.classList.add('collection_arrow-left');
  rightArrowContainer.classList.add('collection_arrow-right');

  return {
    grid,
    mainImgContainer,
    mainImg,
    mainImgWrapper,
    leftArrowContainer,
    rightArrowContainer,
  };
};

/* 
  2. appendElementsToGrid --------------
    After create, Append elements to grid
*/

const appendElementsToGrid = function () {
  const {
    grid,
    mainImgContainer,
    mainImg,
    mainImgWrapper,
    leftArrowContainer,
    rightArrowContainer,
  } = createCollectionElements();
  mainImgWrapper.appendChild(mainImg);
  mainImgWrapper.appendChild(leftArrowContainer);
  mainImgWrapper.appendChild(rightArrowContainer);

  mainImgContainer.appendChild(mainImgWrapper);
  grid.appendChild(mainImgContainer);
};

/* 
  2. showSmallImgAsMainImg --------------
    Get small img srclist, Find biggest src of small img, Set the src to main img.
*/

const showSmallImgAsMainImg = function ({ smallImgDataSrc }) {
  const findBiggestSmallImgSrc = function () {
    const arr1 = smallImgDataSrc.split(',').map((el) => el.split(' '));
    const arr2 = arr1.map((el) => el[el.length - 1]);

    const bigImgSize = arr2.map((el) => el.slice(0, -1)).sort((a, b) => b - a)[0];

    const endIndex = smallImgDataSrc.lastIndexOf(`${bigImgSize}w`);
    const startIndex = smallImgDataSrc.substring(0, endIndex).lastIndexOf(',');

    return smallImgDataSrc.substring(startIndex + 2, endIndex);
  };

  const setSmallImgSrcToMainImg = function () {
    const mainImg = document.querySelector('.collection_main-img');
    const src = findBiggestSmallImgSrc();

    mainImg.setAttribute('src', src);
    mainImg.setAttribute('data-srcset', smallImgDataSrc);
    mainImg.setAttribute('sizes', '685px');
  };

  setSmallImgSrcToMainImg();

  return mainImg;
};

/* 
  2. useArrow --------------
    Sum Arrow count, Use arrow count to get small image datasrc list
*/

let ARROW_COUNT = 0;
const useArrow = function (smallImgNodeList, { type }) {
  const moveArrowCount = function () {
    if (type === 'left' && ARROW_COUNT > 0) ARROW_COUNT--;
    if (type === 'right' && ARROW_COUNT < smallImgNodeList.length - 1) ARROW_COUNT++;

    return ARROW_COUNT;
  };

  const CURR_INDEX = moveArrowCount();
  const smallImgDataSrc = smallImgNodeList[CURR_INDEX].getAttribute('data-srcset');
  showSmallImgAsMainImg({ smallImgDataSrc });

  return;
};

const attachListeners = function () {
  const smallImgNodeList = document.querySelectorAll('.collection_small-img .img > img');
  const leftArrowContainer = document.querySelector('.collection_arrow-left');
  const rightArrowContainer = document.querySelector('.collection_arrow-left');

  const listenArrowClick = function () {
    leftArrowContainer.addEventListener('click', () => useArrow(smallImgNodeList, { type: 'left' }));
    rightArrowContainer.addEventListener('click', () => useArrow(smallImgNodeList, { type: 'right' }));
  };

  const listenSmallImgToShowAsMain = function () {
    for (let i = 0; i < smallImgNodeList.length; i++) {
      const smallImgDataSrc = smallImgNodeList[i].getAttribute('data-srcset');
      smallImgNodeList[i].addEventListener('click', () => showSmallImgAsMainImg({ smallImgDataSrc }), true);
    }
  };

  listenArrowClick();
  listenSmallImgToShowAsMain();
};

/* function
  mountCollectionDetail 
*/
const mountCollectionDetail = function () {
  const makeDetailMainImg = function () {
    const mountFirstImg = async function () {
      const { slugList, postList, mediaIdList, srcList } = await letsGo();
      const collectionName = window.document.location.pathname;
      const mainImg = document.querySelector('.collection_main-img');

      for (let i in slugList) {
        if (collectionName.includes(slugList[i])) {
          const collectionImgUrl = srcList[i];
          mainImg.setAttribute('src', collectionImgUrl);

          return;
        }
      }
    };

    return mountFirstImg();
  };

  const setMainImgVisible = function () {
    const mainImgWrapper = document.querySelector('.collection_main-img-wrapper');
    mainImgWrapper.classList.remove('hidden'); // mainImgWrapper null
  };

  appendElementsToGrid();
  attachListeners();
  makeDetailMainImg(); // 첫이미지 mount
  setTimeout(setMainImgVisible, 300); // mainImg 보이게
  return;
};

/* function: addCustomRouterEvent */
function addCustomRouterEvent() {
  history.pushState = ((f) =>
    function pushState() {
      var ret = f.apply(this, arguments);
      window.dispatchEvent(new Event('pushstate'));
      window.dispatchEvent(new Event('locationchange'));
      return ret;
    })(history.pushState);

  history.replaceState = ((f) =>
    function replaceState() {
      var ret = f.apply(this, arguments);
      window.dispatchEvent(new Event('replacestate'));
      window.dispatchEvent(new Event('locationchange'));
      return ret;
    })(history.replaceState);

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });

  window.addEventListener('locationchange', async function () {
    if (window.document.location.pathname.includes('/collection-')) {
      history.go(0);
      await setTimeout(mountCollectionDetail, 200);
    }
  });
}

window.addEventListener('load', () => addCustomRouterEvent());
window.addEventListener('load', () => setTimeout(mountCollectionDetail, 200));
