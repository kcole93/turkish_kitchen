<template>
  <form
    @submit.prevent="submitForm"
    class="flex flex-col md:flex-row items-center justify-center"
  >
    <input
      v-model="email"
      type="email"
      placeholder="Enter your email"
      class="w-full md:w-auto py-2 px-4 bg-white text-gray-800 rounded-lg shadow-md mr-0 md:mr-4 mb-4 md:mb-0 focus:ring-2 focus:ring-primary"
    />
    <button
      type="submit"
      class="w-full md:w-auto bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded"
    >
      Subscribe
    </button>
  </form>
</template>

<script>
  export default {
    data() {
      return {
        email: ''
      }
    },
    methods: {
      async submitForm() {
        if (!this.email) {
          alert('Please enter a valid email address.')
          return
        }

        try {
          // Replace with your API call for subscribing the email
          // await axios.post('/api/subscribe', { email: this.email });

          alert('Thank you for subscribing!')
          this.email = ''
        } catch (error) {
          alert('An error occurred. Please try again later.')
        }
      }
    }
  }
</script>
