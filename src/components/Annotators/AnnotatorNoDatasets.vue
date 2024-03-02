<template>
  <div class="annotator-no-datasets">
    <img src="/static/imgs/no-dataset-background.svg">
    <label>
      No datasets have been created yet.<br>
      Once you've created one, invite annotators to your team and select them
      in your dataset settings to view their progress.
    </label>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.annotator-no-datasets {
  width: 100%;
  height: 100%;
  @include col--center;
  padding-bottom: 40px;

  img {
    max-width: 566px;
    margin: 0 50px 20px 50px;
  }

  label {
    color: $colorSecondaryLight;
    text-align: center;
    @include typography(md-1);
    line-height: 24px;
  }
}
</style>
