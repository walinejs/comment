import { getArticleCounter, updateArticleCounter } from "@waline/api";

import {
  computed,
  defineComponent,
  html,
  onMounted,
  onUnmounted,
  ref,
} from "../vue-lit.js";
import { useReactionStorage } from "../composables/reaction.js";

export interface ReactionItem {
  icon: string;
  desc: string;
  active?: boolean;
}

defineComponent("waline-reaction", ["config"], (props) => {
  const reactionStorage = useReactionStorage();

  const votingIndex = ref(-1);
  const voteNumbers = ref<number[]>([]);

  const locale = computed(() => props.config.locale);
  const isReactionEnabled = computed(() => props.config.reaction.length > 0);

  const reactionsInfo = computed<ReactionItem[]>(() => {
    const { reaction, path } = props.config;

    return reaction.map((icon, index) => ({
      icon,
      desc: locale.value[`reaction${index}` as keyof WalineReactionLocale],
      active: reactionStorage.value[path] === index,
    }));
  });

  let abort: () => void;

  const fetchReaction = async (): Promise<void> => {
    if (isReactionEnabled.value) {
      const { serverURL, lang, path, reaction } = props.config;
      const controller = new AbortController();

      abort = controller.abort.bind(controller);

      const resp = await getArticleCounter({
        serverURL,
        lang,
        paths: [path],
        type: reaction.map((_reaction, index) => `reaction${index}`),
        signal: controller.signal,
      });

      // TODO: Remove this compact code
      if (Array.isArray(resp) || typeof resp === "number") return;

      voteNumbers.value = reaction.map(
        (_reaction, index) => resp[`reaction${index}`]
      );
    }
  };

  const vote = async (index: number): Promise<void> => {
    // we should ensure that only one vote request is sent at a time
    if (votingIndex.value === -1) {
      const { serverURL, lang, path } = props.config;
      const currentVoteItemIndex = reactionStorage.value[path];

      // mark voting status
      votingIndex.value = index;

      // if user already vote current article, decrease the voted item number
      if (currentVoteItemIndex !== undefined) {
        await updateArticleCounter({
          serverURL,
          lang,
          path,
          type: `reaction${currentVoteItemIndex}`,
          action: "desc",
        });

        voteNumbers.value[currentVoteItemIndex] = Math.max(
          voteNumbers.value[currentVoteItemIndex] - 1,
          0
        );
      }

      // increase voting number if current reaction item is not been voted
      if (currentVoteItemIndex !== index) {
        await updateArticleCounter({
          serverURL,
          lang,
          path,
          type: `reaction${index}`,
        });
        voteNumbers.value[index] = (voteNumbers.value[index] || 0) + 1;
      }

      // update vote info in local storage
      if (currentVoteItemIndex === index) delete reactionStorage.value[path];
      else reactionStorage.value[path] = index;

      // voting is completed
      votingIndex.value = -1;
    }
  };

  onMounted(() => {
    watch(
      () => [props.config.serverURL, props.config.path],
      () => {
        void fetchReaction();
      },
      { immediate: true }
    );
  });
  onUnmounted(() => abort?.());

  return () => html`
    <button @click=${toggle}>toggle child</button>
    <p>${state.text} <input value=${state.text} @input=${onInput} /></p>
    <p>A: ${state.childData.text}</p>
    ${state.show
      ? html`<my-child msg=${state.text} .data=${state.childData}></my-child>`
      : ``}
  `;
});
