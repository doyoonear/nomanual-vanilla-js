

async function getFirstImgSrc() {
  const fetchPostList = async (slug) => { // slug 보내서 해당 post 가져옴
    try {
      const [res] = await window
        .fetch(`https://nomanual-official.com/wp-json/wp/v2/posts?slug=${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((res) => res.json());
  
      const result = res.featured_media;

      return result;
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMediaSrcById = function (mediaId) { //mediaId 뽑음
    return window
      .fetch(`https://nomanual-official.com/wp-json/wp/v2/media/${mediaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((res) => res.json());
  };
  
  const slug = window.location.pathname.split('/')[1]; // slug 를 맨처음 가지고옴
  const mediaId = await fetchPostList(slug);
  const mediaSrc = await fetchMediaSrcById(mediaId);
  console.log('mediaSrc', mediaSrc.source_url);
  return mediaSrc.source_url;
}


async function useMediaSrc() {
  try {
    const slugList = await fetchSlugListByCategoryId(); 
    const postList = await getPostListBySlug(slugList); 
    const mediaIdList = postList.map((post) => post.featured_media); 
    const srcList = await getMediaSrc(mediaIdList); // 이제 맞는 slug 인 곳에 route 로 이동했을때 거기것을 가져다가 쓰기
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
  API
  /wp-json/wp/v2/posts

  params: 
  - categories = 2 (int) (2가 collection 카테고리)
  - per_page (int) 한번 호출할때 20개로 일단 제한함 - limit

  - response: [{}, {}]
  - properties
      author: number
      categories: [categoryId, categoryId]
      comment_status: string
      content: {rendered: string, protected: boolean}
      date: date
      date_gmt: date
      excerpt: {rendered: string, protected: boolean}
      featured_media: number 
      format: string
      grid: "{\r\n  \"colCount\": 12,\r\n  \"colGutter\": 1,\r
      guid: {rendered: 'https://nomanual-official.com/collection-2017fw-this-is-my-home-film-2/'}
      id: number
      link: string
      meta: []
      modified: date
      modified_gmt: date
      phonegrid: string
      ping_status: string
      slug: string
      status: string
      sticky: boolean
      tags: [number, number]
      template: string
      title: {rendered: '2017SS &#8220;IT’S THE RULE.&#8221;'}
      type: string
      _links: {self: Array(1), collection: Array(1), about ...}
*/
const fetchSlugListByCategoryId = async function () {
  const data = await window
    .fetch('https://nomanual-official.com/wp-json/wp/v2/posts?categories=2&per_page=30', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((res) => res.json());

  const collectionDetailSlugs = data.filter((post) => post.slug.includes('collection-')).map((post) => post.slug);
  return collectionDetailSlugs;
};

/*
  params: slug (string)
  response: { post }
*/

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

/*
  API: GET
  /v2/media/${mediaId}

  params: mediaId
  
  response: string ?

*/

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
    const srcList = await getMediaSrc(mediaIdList); // 이제 맞는 slug 인 곳에 route 로 이동했을때 거기것을 가져다가 쓰기
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
  return;
};

/* 
  3. useArrow --------------
    Sum Arrow count, Use arrow count to get small image datasrc list
*/


let COUNT = 0;
const useArrow = function (smallImgNodeList, { moveArrowCount, type }) {
  const CURR_INDEX = moveArrowCount(COUNT, type);
  const smallImgDataSrc = smallImgNodeList[CURR_INDEX].getAttribute('data-srcset');
  showSmallImgAsMainImg({ smallImgDataSrc });
  COUNT = CURR_INDEX;
  return;
};

/* 
  4. attachListeners --------------
    Attach Listeners
*/

const attachListeners = function () {
  const smallImgNodeList = document.querySelectorAll('.collection_small-img .img > img');
  const leftArrowContainer = document.querySelector('.collection_arrow-left');
  const rightArrowContainer = document.querySelector('.collection_arrow-right');

  const listenArrowClick = function () {
    const moveArrowCount = function (count, type) {
      if (type === 'left' && count > 0) count--;
      if (type === 'right' && count < smallImgNodeList.length - 1) count++;
  
      return count;
    };

    leftArrowContainer.addEventListener('click', () => useArrow(smallImgNodeList, { moveArrowCount, type: 'right' }));
    rightArrowContainer.addEventListener('click', () => useArrow(smallImgNodeList, { moveArrowCount, type: 'right' }));
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

/* 
  mountCollectionDetail 
*/
const mountCollectionDetail = function () {
   const makeDetailMainImg = function () {
    const mountFirstImg = async function () {
      const collectionImgUrl = await getFirstImgSrc();
      const mainImg = document.querySelector('.collection_main-img');
      mainImg.setAttribute('src', collectionImgUrl);
    };

    return mountFirstImg();
  };

  const setMainImgVisible = function () {
    const mainImgWrapper = document.querySelector('.collection_main-img-wrapper');
    mainImgWrapper.classList.remove('hidden'); 
  };

  appendElementsToGrid();
  attachListeners();
  makeDetailMainImg(); 
  setTimeout(setMainImgVisible, 300); 
  return;
};

/* addCustomRouterEvent */
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
