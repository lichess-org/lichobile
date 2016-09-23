import { header as headerWidget, backButton } from '../../shared/common';
import layout from '../../layout';

export default function view(vnode) {
  const ctrl = vnode.state;
  const headerCtrl = () => headerWidget(null,
    backButton(ctrl.thread() ? ctrl.thread().name : null)
  );
  const bodyCtrl = threadBody.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl);
}

function threadBody(ctrl) {
  if (!ctrl.thread()) return null;
  console.log(ctrl.thread());
  return (
    <div key={ctrl.thread().id} className="threadWrapper native_scroller">
      {ctrl.thread().posts.map(renderPost)}
    </div>
  );
}

function renderPost(post, index, posts) {
  let postId = 'postWrapper';
  if (index === 0)
    postId += ' first';
  if (index === posts.length-1)
    postId += ' last';
  return (
    <div className={postId} key={post.createdAd}>
      <div className="infos">
        <span>{post.sender}</span>
        <span data-icon="H"></span>
        <span>{post.receiver}</span>
        <span>&nbsp;-&nbsp;</span>
        <span>{postDateFormat(post.createdAt)}</span>
      </div>
      <div className="text">{post.text}</div>
    </div>
  );
}

function postDateFormat (timeInMillis) {
  const time = window.moment(timeInMillis);
  return time.format('MMM D H:mm');
}
