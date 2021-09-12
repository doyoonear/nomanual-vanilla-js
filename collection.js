/* getFirstImgSrc */

async function getFirstImgSrc() {
  const fetchPostBySlug = async (slug) => { 
    try {
      const [result] = await window
        .fetch(`https://nomanual-official.com/wp-json/wp/v2/posts?slug=${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((res) => res.json());
  
      return result.featured_media;
    } catch (err) {
      console.error(err);
    }
  };

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
  
  const slug = window.location.pathname.split('/')[1];
  const mediaId = await fetchPostBySlug(slug);
  const mediaSrc = await fetchMediaSrcById(mediaId);
  return mediaSrc.source_url;
}

/* 
  API
  /wp-json/wp/v2/posts

  params: 
  - categories = 2 (int) (2가 collection 카테고리)
  - per_page (int) 한번 호출할때 20개로 일단 제한함 - limit

  - response: [{}, {}]
  - properties for 1 post
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
const mountCollectionDetail = async function () {
  if(!window.location.pathname.includes('/collection-')) return;

   const makeDetailMainImg = async function () {
    const collectionImgUrl = await getFirstImgSrc();
    const mainImg = document.querySelector('.collection_main-img');
    mainImg.setAttribute('src', collectionImgUrl);

    const setMainImgVisible = function () {
      const mainImgWrapper = document.querySelector('.collection_main-img-wrapper');
      mainImgWrapper.classList.remove('hidden'); 
    };

    setMainImgVisible(); 
  };


  appendElementsToGrid();
  attachListeners();
  await makeDetailMainImg(); 

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

  window.addEventListener('locationchange', function () {
    if (window.location.pathname.includes('/collection-')) {
      history.go(0);
      mountCollectionDetail();
    }
  });
}

window.addEventListener('load', () => addCustomRouterEvent());
window.addEventListener('load', () => mountCollectionDetail());
