<template>
  <div class="max-w-6xl mx-auto px-6 py-12 space-y-15">
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Managing your vocabulary</h1>
    </div>

    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        Manage your concepts, collections, and concept schemes
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mr-3"
              >1</span
            >
            <h3 class="text-lg font-semibold text-gray-900">View a resource</h3>
          </div>
          <p class="text-gray-600 leading-relaxed">
            The vocabulary resources are displayed in the left sidebar. Click on a resource to view
            it.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mr-3"
              >2</span
            >
            <h3 class="text-lg font-semibold text-gray-900">Create a new resource</h3>
          </div>
          <p class="text-gray-600 leading-relaxed">
            Click on the "Create new" option in the resource menu to create a new resource.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mr-3"
              >3</span
            >
            <h3 class="text-lg font-semibold text-gray-900">Edit a resource</h3>
          </div>
          <p class="text-gray-600 leading-relaxed">
            When viewing a resource, on the top-right of the resource, click "Edit" to start editing
            the resource.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mr-3"
              >4</span
            >
            <h3 class="text-lg font-semibold text-gray-900">Delete a resource</h3>
          </div>
          <p class="text-gray-600 leading-relaxed">
            In the left sidebar, to delete a resource, click on the 3-dot sub-menu and select
            "Delete".
          </p>
        </div>
      </div>
    </div>

    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Validation</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mr-3"
              >1</span
            >
            <h3 class="text-lg font-semibold text-gray-900">
              Conformance to SKOS and the VocPub Profile
            </h3>
          </div>
          <p class="text-gray-600 leading-relaxed">
            VocEdit uses the VocPub Profile of SKOS to validate your data. This profile follows
            vocabulary best practices to ensure your data is valid and publication ready.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mr-3"
              >2</span
            >
            <h3 class="text-lg font-semibold text-gray-900">View the validation report</h3>
          </div>
          <p class="text-gray-600 leading-relaxed">
            In the menu bar, click on the "Validation" option to view the validation report. This
            will show you any errors or warnings in your data according to the VocPub Profile.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mr-3"
              >3</span
            >
            <h3 class="text-lg font-semibold text-gray-900">Editorial workflow</h3>
          </div>
          <p class="text-gray-600 leading-relaxed">
            Check the validation report frequently to ensure your changes meet the VocPub Profile.
          </p>
        </div>
      </div>
    </div>

    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Saving your work</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mr-3"
              >1</span
            >
            <h3 class="text-lg font-semibold text-gray-900">Save your work</h3>
          </div>
          <p class="text-gray-600 leading-relaxed">
            Under the "Project" menu, click on the "Save" option to save your work.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mr-3"
              >2</span
            >
            <h3 class="text-lg font-semibold text-gray-900">Save to source</h3>
          </div>
          <p class="text-gray-600 leading-relaxed">
            VocEdit remembers where you opened your project from — file system or GitHub — and
            automatically saves changes back to the original location.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mr-3"
              >3</span
            >
            <h3 class="text-lg font-semibold text-gray-900">Save format</h3>
          </div>
          <p class="text-gray-600 leading-relaxed">
            VocEdit saves the project in RDF Turtle format using
            <a
              class="text-primary hover:underline"
              href="https://github.com/RDFLib/rdflib"
              target="_blank"
              rel="noopener,noreferrer"
              >RDFLib's</a
            >
            <code>longturtle</code> style suitable for git diffs.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
