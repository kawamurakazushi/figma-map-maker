import { h } from "preact";

const Visible = ({ size = 32 }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.00019 11C5.70033 11 3.67803 9.80581 2.52182 8C3.67803 6.19419 5.70033 5 8.00019 5C10.3 5 12.3223 6.19419 13.4785 8C12.3223 9.80581 10.3 11 8.00019 11ZM8.00019 4C10.8782 4 13.3776 5.6211 14.6351 8C13.3776 10.3789 10.8782 12 8.00019 12C5.12214 12 2.62273 10.3789 1.36523 8C2.62273 5.6211 5.12214 4 8.00019 4ZM8.00049 10C9.10506 10 10.0005 9.10457 10.0005 8C10.0005 6.89543 9.10506 6 8.00049 6C6.89592 6 6.00049 6.89543 6.00049 8C6.00049 9.10457 6.89592 10 8.00049 10Z"
        fill="#333333"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export { Visible };
